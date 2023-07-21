import React, { ReactElement, useCallback, useEffect, useState } from 'react'
import AssetList from '@shared/AssetList'
import queryString, { ParsedQuery } from 'query-string'
import Sort from './sort'
import {
  AggregationResultUI,
  formatUIResults,
  getResults,
  updateQueryStringParameter
} from './utils'
import { useUserPreferences } from '@context/UserPreferences'
import { useCancelToken } from '@hooks/useCancelToken'
import styles from './index.module.css'
import { useRouter } from 'next/router'
import FacetedSearch from '@shared/facetedSearch/FacetedSearch'
import FacetedTextSearchBar from '@components/@shared/facetedSearch/FacetedTextSearchBar'

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

  useEffect(() => {
    const parsed = queryString.parse(location.search)
    const { sort, sortOrder } = parsed
    setParsed(parsed)
    setSortDirection(sortOrder as string)
    setSortType(sort as string)
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
    const { page } = parsed
    if (queryResult.totalPages < Number(page)) updatePage(1)
  }, [parsed, queryResult, updatePage])

  useEffect(() => {
    if (!parsed || !chainIds) return
    fetchAssets(parsed, chainIds)
  }, [parsed, chainIds, newCancelToken, fetchAssets])

  const setPageAssets = (queryResult: any) => {
    setQueryResult(queryResult)
  }

  return (
    <>
      <div className={styles.search}>
        <div className={styles.row}>
          <div className={styles.searchBar}>
            <FacetedTextSearchBar
              placeholder="Search for service offerings"
              isSearchPage={true}
            />
          </div>
          <Sort
            sortType={sortType}
            sortDirection={sortDirection}
            setSortType={setSortType}
            setSortDirection={setSortDirection}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ marginTop: 37, marginRight: 30 }}>
          <FacetedSearch
            searchCategories={aggregations || []}
            chainIds={chainIds}
            setPageAssets={async (assets: PagedAssets): Promise<void> =>
              setPageAssets(assets)
            }
          />
        </div>

        <div
          style={{ display: 'grid', flexGrow: 1 }}
          className={styles.results}
        >
          <AssetList
            assets={queryResult?.results}
            showPagination
            isLoading={loading}
            page={queryResult?.page}
            totalPages={queryResult?.totalPages}
            onPageChange={updatePage}
            showAssetViewSelector
          />
        </div>
      </div>
    </>
  )
}
