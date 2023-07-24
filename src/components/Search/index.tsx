import React, { ReactElement, useCallback, useEffect, useState } from 'react'
import AssetList from '@shared/AssetList'
import queryString from 'query-string'
import Sort from './sort'
import {
  AggregationResultUI,
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
import { MultiValue } from 'react-select'
import { AutoCompleteOption } from '@shared/facetedSearch/FacetedSearchFilterAutoComplete'

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
  const [filterTags, setFilterTags] = useState<MultiValue<AutoCompleteOption>>(
    []
  )
  // TODO static search name
  const [selectedOptions, setSelectedOptions] = useState<
    Array<{
      category: string
      label: string
      isSelected: boolean
      location: string
    }>
  >([])
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
    setTotalResults(queryResult?.totalResults || 0)
    setTotalPagesNumber(queryResult?.totalPages || 0)
  }

  // console.log(`sortType: ${sortType}`)
  // console.log(`sortDirection: ${sortDirection}`)

  // console.log(`page: ${page}`)

  return (
    <>
      <div className={styles.search}>
        <div className={styles.row}>
          <div className={styles.searchBar}>
            <FacetedTextSearchBar
              placeholder="Search for service offerings"
              isSearchPage={true}
              initialValue={searchText}
              onValueChange={(value: string) => {
                // console.log('text changed')
                setSearchText(value)
              }}
              onSearch={async (
                text: string
                // dynamicFilters: {
                // location: string
                // value: string

                // }[]
              ): Promise<void> => {
                const labelList: string[] = filterTags.map(
                  (option) => option.label
                )
                const filteredResults = aggregations?.tags?.filter(
                  (result: Keyword) =>
                    labelList.includes(result.label as string)
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
                    text, // TODO do we need this
                    filters: [...tagFilter, ...staticFilter],
                    sort: sortType,
                    sortDirection,
                    // TODO no clue why they made it a string
                    page: page.toString()
                  },
                  chainIds
                )
                setPageAssets(assets)
              }}
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
            // setSortDirection={setSortDirection}
          />
        </div>
      </div>

      {/* // TODO styling */}
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ marginTop: 37, marginRight: 30 }}>
          {aggregations && (
            <FacetedSearch
              searchCategories={aggregations}
              // chainIds={chainIds}
              // setPageAssets={async (assets: PagedAssets): Promise<void> =>
              //   setPageAssets(assets)
              // }
              onClearFilter={async () => {
                // TODO no url needed anymore
                // const url: URL = new URL(window.location.href)
                // const { searchParams } = url
                // searchParams.delete('text')
                // await router.push(
                //   `${url.origin}${url.pathname}?${searchParams.toString()}`
                // )
                // TODO we still have duplicate places we track things
                setFilterTags([])
                setSelectedOptions([])
                setSearchText('')
              }}
              onSetTagsFilter={(tags: MultiValue<AutoCompleteOption>) =>
                setFilterTags(tags)
              }
              // TODO name static
              onSetSelectedOptions={(
                options: Array<{
                  category: string
                  label: string
                  isSelected: boolean
                  location: string
                }>
              ) => setSelectedOptions(options)}
              onSearch={async (
                // text: string,
                dynamicFilters: {
                  location: string
                  term: string | number // TODO number?
                }[]
              ): Promise<void> => {
                // console.log('SEARCH CALLBACK EXECUTED')
                const assets: PagedAssets = await getResults(
                  {
                    text: searchText,
                    filters: dynamicFilters, // TODO var name
                    sort: sortType,
                    sortDirection,
                    // TODO no clue why they made it a string
                    page: page.toString()
                  },
                  chainIds
                )
                setPageAssets(assets)
              }}
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
            onPageChange={async (value): Promise<void> => {
              setPage(value)

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
                  sortDirection,
                  // TODO no clue why they made it a string
                  page: value.toString()
                },
                chainIds
              )
              setPageAssets(assets)
            }} // updatePage}
            showAssetViewSelector
          />
        </div>
      </div>
    </>
  )
}
