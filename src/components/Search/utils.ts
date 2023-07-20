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
    owner?: string
    tags?: string
    page?: string
    offset?: string
    sort?: string
    sortDirection?: string
    serviceType?: string
    accessType?: string
    complianceType?: string
    dynamicFilters?: {
      location: string
      value: string
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
  [x: string]: { buckets: { key: string; doc_count: number }[] | number }
}

export const getDataLocation = () => {
  return [
    {
      label: 'verified',
      location:
        'metadata.additionalInformation.gaiaXInformation.serviceSD.isVerified',
      size: 100
    },
    {
      label: 'termsAndConditions',
      location: 'metadata.additionalInformation.termsAndConditions',
      size: 100
    },
    {
      label: 'language',
      location: 'metadata.algorithm.language.keyword',
      size: 100
    },
    {
      label: 'author',
      location: 'metadata.author.keyword',
      size: 100
    },
    {
      label: 'tags',
      location: 'metadata.tags.keyword',
      size: 100
    },
    {
      label: 'orders',
      location: 'stats.orders',
      size: 100
    },
    {
      label: 'serviceType',
      location: 'services.type.keyword',
      size: 100
    },
    {
      label: 'metadataType',
      location: 'metadata.type.keyword',
      size: 100
    }
  ]
}

export const facetedQuery = (): AggregationQuery => {
  const terms = getDataLocation()
  let aggQuery: AggregationQuery = {}
  terms.forEach((t) => {
    aggQuery = Object.assign(
      JSON.parse(
        `{ "${t.label}": { "terms": { "field": "${t.location}", "size": "${
          t.size ?? 100
        }" } } }`
      ),
      aggQuery
    )
  })
  return aggQuery
}

export async function getResults(
  params: {
    text?: string
    owner?: string
    tags?: string
    categories?: string
    page?: string
    offset?: string
    sort?: string
    sortOrder?: string
    serviceType?: string
    accessType?: string
    complianceType?: string
    dynamicFilters?: {
      location: string
      value: string
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
