import React, { ReactElement, useCallback, useEffect, useState } from 'react'
import AssetList from '@shared/AssetList'
import queryString from 'query-string'
import Sort from './sort'
import {
  AggregationResult,
  AggregationResultUI,
  Filter,
  formatUIResults,
  getResults,
  Keyword,
  StaticOption,
  updateQueryStringParameter
} from './utils'
import { useUserPreferences } from '@context/UserPreferences'
import { useCancelToken } from '@hooks/useCancelToken'
import styles from './index.module.css'
import { useRouter } from 'next/router'
import FacetedSearch from '@shared/facetedSearch/FacetedSearch'
import FacetedTextSearchBar from '@components/@shared/facetedSearch/FacetedTextSearchBar'

interface SearchParams {
  tags?: Array<Keyword>
  text?: string
  staticOptions?: Array<StaticOption>
  currentPage?: number
  sort?: string
  sortOrder?: string
}

export default function SearchPage({
  setTotalResults,
  setTotalPagesNumber
}: {
  setTotalResults: (totalResults: number) => void
  setTotalPagesNumber: (totalPagesNumber: number) => void
}): ReactElement {
  const router = useRouter()
  const newCancelToken = useCancelToken()
  const { chainIds } = useUserPreferences()
  const [parsed, setParsed] = useState<queryString.ParsedQuery>()
  const [queryResult, setQueryResult] = useState<PagedAssets>()
  const [aggregations, setAggregations] = useState<AggregationResultUI>()
  const [loading, setLoading] = useState<boolean>()
  const [sortType, setSortType] = useState<string>()
  const [sortDirection, setSortDirection] = useState<string>()
  const [searchText, setSearchText] = useState<string>()
  const [tagsFilter, setTagsFilter] = useState<Array<Keyword>>([])
  const [staticFilter, setStaticFilter] = useState<Array<StaticOption>>([])
  const [page, setPage] = useState<number>(1)

  useEffect(() => {
    const parsed = queryString.parse(location.search)
    setParsed(parsed)
  }, [router])

  const updatePage = useCallback(
    (page: number) => {
      const { pathname, query } = router
      const newUrl = updateQueryStringParameter(
        pathname +
          '?' +
          JSON.stringify(query)
            .replace(/"|{|}/g, '')
            .replace(/:/g, '=')
            .replace(/,/g, '&'),
        'page',
        `${page}`
      )
      return router.push(newUrl)
    },
    [router]
  )

  const setPageAssets = (queryResult: PagedAssets): void => {
    setQueryResult(queryResult)
    setTotalResults(queryResult?.totalResults || 0)
    setTotalPagesNumber(queryResult?.totalPages || 0)
    setLoading(false)
  }

  const fetchAssets = useCallback(
    async (
      parsed: queryString.ParsedQuery,
      chainIds: number[]
    ): Promise<void> => {
      setLoading(true)
      setTotalResults(undefined)
      const queryResult = await getResults(parsed, chainIds, newCancelToken())
      const aggregationResult = await getResults(
        { faceted: true, offset: 0 },
        chainIds,
        newCancelToken()
      )

      setAggregations(formatUIResults(aggregationResult))
      setPageAssets(queryResult)
    },
    [newCancelToken, setTotalPagesNumber, setTotalResults]
  )

  useEffect((): void => {
    if (!parsed || !queryResult) return
    const { page } = parsed
    if (queryResult.totalPages < Number(page)) {
      updatePage(1)
    }
  }, [parsed, queryResult])

  useEffect((): void => {
    if (!parsed || !chainIds) return
    fetchAssets(parsed, chainIds)
  }, [parsed, chainIds, newCancelToken, fetchAssets])

  async function onUpdateMenu(
    args?: Omit<SearchParams, 'currentPage' | 'sort' | 'sortOrder'>
  ): Promise<void> {
    const {
      text = searchText,
      tags = tagsFilter,
      staticOptions = staticFilter
    } = args || {}
    const tagsFilters: Array<Filter> = tags.map((item: Keyword) => item.filter)

    const staticFilters: Array<Filter> = staticOptions.map(
      (item: StaticOption) => item.filter
    )

    const facetedResult: AggregationResultUI = formatUIResults(
      await getResults(
        {
          text,
          filters: [...tagsFilters, ...staticFilters],
          offset: 0,
          faceted: true
        },
        chainIds,
        newCancelToken()
      )
    )

    if (aggregations) {
      const updatedAggregationResult: AggregationResult[] =
        aggregations.static.map(
          (item: AggregationResult): AggregationResult => {
            const commonCategory: AggregationResult = facetedResult.static.find(
              (a: AggregationResult): boolean => a.category === item.category
            )
            return {
              category: item.category,
              keywords: item.keywords.map((a: Keyword): Keyword => {
                const facetedResult: Keyword = commonCategory.keywords.find(
                  (b: Keyword): boolean => b.label === a.label
                )
                if (facetedResult) {
                  return facetedResult
                }
                return {
                  ...a,
                  count: 0
                }
              })
            }
          }
        )
      setAggregations({
        static: [...updatedAggregationResult],
        tags: [...aggregations.tags]
      })
    }
  }

  const onSearch = async (args?: SearchParams): Promise<void> => {
    const {
      text = searchText,
      tags = tagsFilter,
      staticOptions = staticFilter,
      currentPage = page,
      sort = sortType,
      sortOrder = sortDirection
    } = args || {}
    setLoading(true)
    const tagsFilters: Array<Filter> = tags.map((item: Keyword) => item.filter)

    const staticFilters: Array<Filter> = staticOptions.map(
      (item: StaticOption) => item.filter
    )

    const assets: PagedAssets = await getResults(
      {
        text,
        filters: [...tagsFilters, ...staticFilters],
        sort,
        sortDirection: sortOrder,
        page: currentPage
      },
      chainIds,
      newCancelToken()
    )

    await onUpdateMenu()
    setPageAssets(assets)
  }

  useEffect((): void => {
    onSearch()
  }, [page, tagsFilter, staticFilter, sortDirection, sortType])

  useEffect((): void => {
    if ((queryResult?.totalPages || 1) < page) {
      setPage(1)
    }
  }, [queryResult])

  const onSetTags = async (tags: Array<Keyword>): Promise<void> => {
    setTagsFilter(tags)
  }

  const onClearFilter = async (): Promise<void> => {
    setTagsFilter([])
    setStaticFilter([])
    setSearchText('')
  }

  const onTextValueChange = (value: string): void => {
    setSearchText(value)
  }

  const onTextSearch = async (value: string): Promise<void> => {
    await onSearch({ text: value })
  }

  const onSetStaticFilter = async (
    options: Array<StaticOption>
  ): Promise<void> => {
    setStaticFilter(options)
  }

  const onPageChange = async (value: number): Promise<void> => {
    setPage(value)
  }

  const onSetSortDirection = async (value: string): Promise<void> => {
    setSortDirection(value)
  }

  const onSetSortType = async (value: string): Promise<void> => {
    setSortType(value)
  }

  return (
    <>
      <div className={styles.search}>
        <div className={styles.row}>
          <div className={styles.searchBar}>
            <FacetedTextSearchBar
              placeholder="Search for service offerings"
              isSearchPage={true}
              initialValue={searchText}
              onValueChange={onTextValueChange}
              onSearch={onTextSearch}
            />
          </div>
          <Sort
            sortType={sortType}
            sortDirection={sortDirection}
            setSortType={onSetSortType}
            setSortDirection={onSetSortDirection}
          />
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.facetedSearch}>
          {aggregations && (
            <FacetedSearch
              searchCategories={aggregations}
              onClearFilter={onClearFilter}
              onSetTagsFilter={onSetTags}
              onSetStaticFilter={onSetStaticFilter}
            />
          )}
        </div>
        <div className={styles.results}>
          <AssetList
            assets={queryResult?.results}
            showPagination
            isLoading={loading}
            page={queryResult?.page}
            totalPages={queryResult?.totalPages}
            onPageChange={onPageChange}
            showAssetViewSelector
          />
        </div>
      </div>
    </>
  )
}
