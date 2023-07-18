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

interface DynamicFilter {
  header: string
  key: string
  value?: string | string[]
  size?: number
}

const retrieveDynamicFiltersSet = (): DynamicFilter[] => {
  const filters = process.env.NEXT_PUBLIC_DYNAMIC_FILTERS
  const props = filters ? filters.split(';') : []
  const terms = props.map((p) => p.split(','))
  return terms.map((t) => {
    const size = !isNaN(+t[t.length - 1]) ? +t[t.length - 1] : undefined
    return {
      header: t.shift(),
      key: t.shift(),
      size
    }
  })
}

const getValidDynamicFilters = (filters?: {
  [x: string]: string | string[]
}): DynamicFilter[] => {
  const dynamicFilters = retrieveDynamicFiltersSet()
  if (!filters) {
    return dynamicFilters
  }
  const keys = Object.keys(filters)
  return dynamicFilters
    .filter((e) => keys.includes(e.header))
    .map((df) => {
      df.value = filters[df.header]
      return df
    })
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
  },
  chainIds: number[]
): SearchQuery {
  const {
    tags,
    page,
    offset,
    sort,
    sortDirection,
    serviceType,
    accessType,
    complianceType
  } = params
  const text = escapeEsReservedCharacters(params.text)
  const emptySearchTerm = text === undefined || text === ''
  const filters: FilterTerm[] = []
  let searchTerm = text || ''
  let nestedQuery
  if (tags) {
    filters.push(getFilterTerm('metadata.tags.keyword', tags))
  } else {
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

    nestedQuery = {
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
  }
  accessType && filters.push(getFilterTerm('services.type', accessType))
  serviceType && filters.push(getFilterTerm('metadata.type', serviceType))
  complianceType &&
    filters.push(
      getFilterTerm(
        'metadata.additionalInformation.compliance.keyword',
        complianceType
      )
    )
  process.env.NEXT_PUBLIC_DYNAMIC_FILTERS &&
    filters.push(
      ...getValidDynamicFilters(params).map((f) =>
        getFilterTerm(f.key, f.value)
      )
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

export const facetedQuery = (): AggregationQuery => {
  const terms = getValidDynamicFilters()
  let customAgg: AggregationQuery = {}
  terms.forEach((t) => {
    customAgg = Object.assign(
      JSON.parse(
        `{ "${t.header}": { "terms": { "field": "${t.key}", "size": "${
          t.size ?? 100
        }" } } }`
      ),
      customAgg
    )
  })
  const basicAgg = {
    tags: {
      terms: { field: 'metadata.tags.keyword', size: 100 }
    },
    access: {
      terms: { field: 'services.type.keyword', size: 100 }
    },
    service: {
      terms: { field: 'metadata.type.keyword', size: 100 }
    }
  }
  return { ...basicAgg, ...customAgg }
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
    faceted?: string
  },
  chainIds: number[],
  cancelToken?: CancelToken
): Promise<PagedAssets> {
  const searchQuery = getSearchQuery(params, chainIds)
  const query =
    params.faceted === 'true'
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
