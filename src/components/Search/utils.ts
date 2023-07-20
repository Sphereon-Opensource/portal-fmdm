import { LoggerInstance } from '@oceanprotocol/lib'
import {
  escapeEsReservedCharacters,
  generateBaseQuery,
  getFilterTerm,
  queryMetadata
} from '@utils/aquarius'
import queryString from 'query-string'
import { CancelToken } from 'axios'
import {
  SortDirectionOptions,
  SortTermOptions
} from '../../@types/aquarius/SearchQuery'

export function updateQueryStringParameter(
  uri: string,
  key: string,
  newValue: string
): string {
  const regex = new RegExp('([?&])' + key + '=.*?(&|$)', 'i')
  const separator = uri.indexOf('?') !== -1 ? '&' : '?'

  if (uri.match(regex)) {
    return uri.replace(regex, '$1' + key + '=' + newValue + '$2')
  } else {
    return uri + separator + key + '=' + newValue
  }
}

export function getSearchQuery(
  params: {
    text?: string
    page?: string
    offset?: string
    sort?: string
    sortDirection?: string
    dynamicFilters?: {
      location: string
      value: string | string[]
    }[]
  },
  chainIds: number[]
): SearchQuery {
  const { page, offset, sort, sortDirection, dynamicFilters } = params
  const text = escapeEsReservedCharacters(params.text)
  const emptySearchTerm = text === undefined || text === ''
  const filters: FilterTerm[] = []
  let searchTerm = text || ''
  searchTerm = searchTerm.trim()
  const modifiedSearchTerm = searchTerm.split(' ').join(' OR ').trim()
  const noSpaceSearchTerm = searchTerm.split(' ').join('').trim()

  const prefixedSearchTerm =
    emptySearchTerm && searchTerm
      ? searchTerm
      : !emptySearchTerm && searchTerm
      ? '*' + searchTerm + '*'
      : '**'
  const searchFields = [
    'id',
    'nft.owner',
    'datatokens.address',
    'datatokens.name',
    'datatokens.symbol',
    'metadata.name^10',
    'metadata.author',
    'metadata.description',
    'metadata.tags'
  ]

  const nestedQuery = {
    must: [
      {
        bool: {
          should: [
            {
              query_string: {
                query: `${modifiedSearchTerm}`,
                fields: searchFields,
                minimum_should_match: '2<75%',
                phrase_slop: 2,
                boost: 5
              }
            },
            {
              query_string: {
                query: `${noSpaceSearchTerm}*`,
                fields: searchFields,
                boost: 5,
                lenient: true
              }
            },
            {
              match_phrase: {
                content: {
                  query: `${searchTerm}`,
                  boost: 10
                }
              }
            },
            {
              query_string: {
                query: `${prefixedSearchTerm}`,
                fields: searchFields,
                default_operator: 'AND'
              }
            }
          ]
        }
      }
    ]
  }
  dynamicFilters &&
    filters.push(
      ...dynamicFilters.map((df) => getFilterTerm(df.location, df.value))
    )
  const baseQueryParams = {
    chainIds,
    nestedQuery,
    esPaginationOptions: {
      from: (Number(page) - 1 || 0) * (Number(offset) || 21),
      size: Number(offset) >= 0 ? Number(offset) : 21
    },
    sortOptions: sort ? { sortBy: sort, sortDirection } : undefined,
    filters
  } as BaseQueryParams

  const query = generateBaseQuery(baseQueryParams)
  return query
}

export interface AggregationQuery {
  [x: string]: { terms: { field: string; size?: number } }
}

export interface AggregationResult {
  category: string
  keywords: {
    label: string
    location: string
    count: number
  }[]
}

interface SearchMetadata {
  label: string
  graphQLLabel: string
  location: string
  size?: number
}

export const getSearchMetadata = (): SearchMetadata[] => {
  return [
    {
      label: 'Is Verified',
      graphQLLabel: 'verified',
      location:
        'metadata.additionalInformation.gaiaXInformation.serviceSD.isVerified',
      size: 100
    },
    {
      label: 'Terms And Conditions',
      graphQLLabel: 'termsAndConditions',
      location: 'metadata.additionalInformation.termsAndConditions',
      size: 100
    },
    {
      label: 'Languages',
      graphQLLabel: 'language',
      location: 'metadata.algorithm.language.keyword',
      size: 100
    },
    {
      label: 'Authors',
      graphQLLabel: 'author',
      location: 'metadata.author.keyword',
      size: 100
    },
    {
      label: 'Tags',
      graphQLLabel: 'tags',
      location: 'metadata.tags.keyword',
      size: 100
    },
    {
      label: 'Orders',
      graphQLLabel: 'orders',
      location: 'stats.orders',
      size: 100
    },
    {
      label: 'Service Type',
      graphQLLabel: 'service',
      location: 'services.type.keyword',
      size: 100
    },
    {
      label: 'Access Type',
      graphQLLabel: 'access',
      location: 'metadata.type.keyword',
      size: 100
    },
    {
      label: 'Owners',
      graphQLLabel: 'owner',
      location: 'ntf.owner',
      size: 100
    }
  ]
}

export const facetedQuery = (): AggregationQuery => {
  const terms = getSearchMetadata()
  let aggQuery: AggregationQuery = {}
  terms.forEach((t) => {
    aggQuery = Object.assign(
      JSON.parse(
        `{ "${t.graphQLLabel}": { "terms": { "field": "${t.location}", "size": "${t.size}" } } }`
      ),
      aggQuery
    )
  })
  return aggQuery
}

export async function getResults(
  params: {
    text?: string
    page?: string
    offset?: string
    sort?: string
    sortOrder?: string
    dynamicFilters?: {
      location: string
      value: string | string[]
    }[]
    faceted?: boolean
  },
  chainIds: number[],
  cancelToken?: CancelToken
): Promise<PagedAssets> {
  const searchQuery = getSearchQuery(params, chainIds)
  const query = params.faceted
    ? { ...searchQuery, aggs: facetedQuery() }
    : searchQuery
  return await queryMetadata(query, cancelToken)
}

export async function addExistingParamsToUrl(
  location: Location,
  excludedParams: string[]
): Promise<string> {
  const parsed = queryString.parse(location.search)
  let urlLocation = '/search?'
  if (Object.keys(parsed).length > 0) {
    for (const queryParam in parsed) {
      if (!excludedParams.includes(queryParam)) {
        if (queryParam === 'page' && excludedParams.includes('text')) {
          LoggerInstance.log('remove page when starting a new search')
        } else {
          const value = parsed[queryParam]
          urlLocation = `${urlLocation}${queryParam}=${value}&`
        }
      }
    }
  } else {
    // sort should be relevance when fixed in aqua
    urlLocation = `${urlLocation}sort=${encodeURIComponent(
      SortTermOptions.Created
    )}&sortOrder=${SortDirectionOptions.Descending}&`
  }
  urlLocation = urlLocation.slice(0, -1)
  return urlLocation
}

export function formatFacetedSearchResults(
  results: PagedAssets
): AggregationResult[] {
  const agg: [string, { buckets: { key: string; doc_count: number }[] }][] =
    Object.entries(results.aggregations)
  return agg.map((a) => {
    const metadata = getSearchMetadata().find((m) => m.graphQLLabel === a[0])
    return {
      category: metadata.label,
      keywords: a[1].buckets.map((b) => ({
        label: b.key,
        count: b.doc_count,
        location: metadata.location
      }))
    }
  })
}
