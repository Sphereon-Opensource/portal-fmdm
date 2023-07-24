import React, { ReactElement, useCallback, useEffect, useState } from 'react'
import AssetList from '@shared/AssetList'
import queryString from 'query-string'
import Sort from './sort'
import {
  AggregationResultUI,
  Filter,
  formatUIResults,
  getResults,
  Keyword,
  KeywordResult,
  updateQueryStringParameter
} from './utils'
import { useUserPreferences } from '@context/UserPreferences'
import { useCancelToken } from '@hooks/useCancelToken'
import styles from './index.module.css'
import { useRouter } from 'next/router'
import FacetedSearch from '@shared/facetedSearch/FacetedSearch'
import FacetedTextSearchBar from '@components/@shared/facetedSearch/FacetedTextSearchBar'

// TODO move
export type StaticOption = KeywordResult & {
  category: string
  isSelected: boolean
}

export default function SearchPage({
  setTotalResults,
  setTotalPagesNumber
}: {
  setTotalResults: (totalResults: number) => void
  setTotalPagesNumber: (totalPagesNumber: number) => void
}): ReactElement {
  const router = useRouter()
  const [parsed, setParsed] = useState<queryString.ParsedQuery<string>>()
  const { chainIds } = useUserPreferences()
  const [queryResult, setQueryResult] = useState<PagedAssets>()
  const [aggregations, setAggregations] = useState<AggregationResultUI>()
  const [loading, setLoading] = useState<boolean>()
  const [sortType, setSortType] = useState<string>()
  const [sortDirection, setSortDirection] = useState<string>()
  const newCancelToken = useCancelToken()
  const [searchText, setSearchText] = useState<string>()
  const [filterTags, setFilterTags] = useState<Array<Keyword>>([]) // TODO rename to tags //MultiValue<AutoCompleteOption>
  // TODO static search name
  const [selectedOptions, setSelectedOptions] = useState<Array<StaticOption>>(
    []
  )
  const [page, setPage] = useState<number>(1)

  useEffect(() => {
    const parsed = queryString.parse(location.search)
    // const { sort, sortOrder } = parsed
    setParsed(parsed)
    // setSortDirection(sortOrder as string)
    // setSortType(sort as string)
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

  const fetchAssets = useCallback(
    async (parsed: queryString.ParsedQuery<string>, chainIds: number[]) => {
      setLoading(true)
      setTotalResults(undefined)
      const queryResult = await getResults(parsed, chainIds, newCancelToken())
      const aggregationResult = await getResults(
        { faceted: true, offset: '0' },
        chainIds,
        newCancelToken()
      )

      setAggregations(formatUIResults(aggregationResult))
      setQueryResult(queryResult)

      setTotalResults(queryResult?.totalResults || 0)
      setTotalPagesNumber(queryResult?.totalPages || 0)
      setLoading(false)
    },
    [newCancelToken, setTotalPagesNumber, setTotalResults]
  )

  useEffect(() => {
    if (!parsed || !queryResult) return
    // console.log(aggregations)
    const { page } = parsed
    if (queryResult.totalPages < Number(page)) {
      updatePage(1)
    }
  }, [parsed, queryResult]) //, updatePage

  useEffect(() => {
    if (!parsed || !chainIds) return
    fetchAssets(parsed, chainIds)
  }, [parsed, chainIds, newCancelToken, fetchAssets])

  const setPageAssets = (queryResult: PagedAssets): void => {
    setQueryResult(queryResult)
    // console.log(`queryResult: ${JSON.stringify(queryResult)}`)
    // console.log(`Total results: ${queryResult?.totalResults || 0}`)
    // console.log(`Total page numbers: ${queryResult?.totalPages || 0}`)
    // console.log(`current page: ${page}`)
    setTotalResults(queryResult?.totalResults || 0)
    setTotalPagesNumber(queryResult?.totalPages || 0)
  }

  interface SearchParams {
    tags?: Array<Keyword> // MultiValue<AutoCompleteOption> // TODO make this Keywords interface
    text?: string
    staticOptions?: Array<StaticOption>
    currentPage?: number
  }

  // TODO no args
  const onSearch = async (args: SearchParams): Promise<void> => {
    const {
      tags = filterTags,
      text = searchText,
      staticOptions = selectedOptions,
      currentPage = page
    } = args

    const tagFilter: Array<Filter> = tags.map((item: Keyword) => item.filter)

    const staticFilter: Array<Filter> = staticOptions.map(
      (item: StaticOption) => item.filter
    )

    const assets: PagedAssets = await getResults(
      {
        text,
        filters: [...tagFilter, ...staticFilter],
        sort: sortType,
        sortDirection,
        // TODO no clue why they made it a string
        page: currentPage.toString()
      },
      chainIds
    )

    setPageAssets(assets)
  }

  useEffect(() => {
    onSearch({})
  }, [page, filterTags, selectedOptions])

  useEffect(() => {
    if ((queryResult?.totalPages || 1) < page) {
      setPage(1)
    }
  }, [queryResult])

  const onSetTags = async (tags: Array<Keyword>): Promise<void> => {
    setFilterTags(tags)
    // await onSearch({ tags })
  }

  const onClearFilter = async (): Promise<void> => {
    setFilterTags([])
    setSelectedOptions([])
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
    setSelectedOptions(options) // TODO name
    // await onSearch({ staticOptions: options })
  }

  const onPageChange = async (value: number): Promise<void> => {
    setPage(value)
    // await onSearch({ currentPage: value })
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
            setSortType={async (value: string): Promise<void> => {
              // console.log(`SETTING SORT TYPE: ${value}`)
              setSortType(value)

              const labelList: string[] = filterTags.map(
                (option) => option.label
              )
              const filteredResults = aggregations?.tags?.filter(
                (result: Keyword) => labelList.includes(result.label as string)
              )
              // console.log(`TAGS ${JSON.stringify(filteredResults)}`)

              const tagFilter = filteredResults.map((item: Keyword) => {
                return {
                  location: item.location,
                  term: item.label
                }
              })

              // TODO any
              const staticFilter = selectedOptions.map((item: any) => {
                // console.log(`STATIC: ${JSON.stringify(item)}`)
                return {
                  location: item.location,
                  term: item.label
                }
              })

              // console.log('TEXT SEARCH CALLBACK EXECUTED')
              const assets: PagedAssets = await getResults(
                {
                  text: searchText, // TODO do we need this
                  filters: [...tagFilter, ...staticFilter],
                  sort: value,
                  sortDirection,
                  // TODO no clue why they made it a string
                  page: page.toString()
                },
                chainIds
              )
              setPageAssets(assets)
            }}
            setSortDirection={async (value: string): Promise<void> => {
              // console.log(`SETTING SORT DIRECTION: ${value}`)
              setSortDirection(value)

              const labelList: string[] = filterTags.map(
                (option) => option.label
              )
              const filteredResults = aggregations?.tags?.filter(
                (result: Keyword) => labelList.includes(result.label as string)
              )
              // console.log(`TAGS ${JSON.stringify(filteredResults)}`)

              const tagFilter = filteredResults.map((item: Keyword) => {
                return {
                  location: item.location,
                  term: item.label
                }
              })

              // TODO any
              const staticFilter = selectedOptions.map((item: any) => {
                // console.log(`STATIC: ${JSON.stringify(item)}`)
                return {
                  location: item.location,
                  term: item.label
                }
              })

              // console.log('TEXT SEARCH CALLBACK EXECUTED')
              const assets: PagedAssets = await getResults(
                {
                  text: searchText, // TODO do we need this
                  filters: [...tagFilter, ...staticFilter],
                  sort: sortType,
                  sortDirection: value,
                  // TODO no clue why they made it a string
                  page: page.toString()
                },
                chainIds
              )
              // console.log(JSON.stringify(assets))
              setPageAssets(assets)
            }}
          />
        </div>
      </div>

      {/* // TODO styling */}
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ marginTop: 37, marginRight: 30 }}>
          {aggregations && (
            <FacetedSearch
              searchCategories={aggregations}
              onClearFilter={onClearFilter}
              onSetTagsFilter={onSetTags}
              onSetStaticFilter={onSetStaticFilter}
            />
          )}
        </div>
        <div style={{ flexGrow: 1 }} className={styles.results}>
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
