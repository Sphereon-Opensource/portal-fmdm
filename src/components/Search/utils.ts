import { LoggerInstance } from '@oceanprotocol/lib'
import {
  escapeEsReservedCharacters,
  generateBaseQuery,
  getFilterRange,
  getFilterTerm,
  queryMetadata
} from '@utils/aquarius'
import queryString from 'query-string'
import { CancelToken } from 'axios'
import { SortTermOptions } from '../../@types/aquarius/SearchQuery'

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

export type StaticOption = Keyword & {
  category: string
  isSelected: boolean
}

export interface Range {
  operation: 'gt' | 'lt' | 'gte' | 'lte'
  value: number
}

interface Term {
  value: string | string[]
}

export interface Filter {
  category: string
  location: string
  range?: Range[]
  term?: Term
}

export function getSearchQuery(
  params: {
    text?: string
    page?: number
    offset?: number
    sort?: string
    sortDirection?: string
    filters?: Filter[]
  },
  chainIds: number[]
): SearchQuery {
  const { page, offset, sort, sortDirection, filters } = params
  const text = escapeEsReservedCharacters(params.text)
  const emptySearchTerm = text === undefined || text === ''
  const filterTerms = new Map<string, Array<FilterTerm | FilterRange>>()
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
  filters &&
    filters.forEach((filter) => {
      if (filterTerms.has(filter.category)) {
        if (filter?.term) {
          const terms = filterTerms.get(filter.category)
          terms.push(getFilterTerm(filter.location, filter.term?.value))
          filterTerms.set(filter.category, terms)
        } else if (filter?.range) {
          const terms = filterTerms.get(filter.category)
          terms.push(getFilterRange(filter.location, filter.range))
          filterTerms.set(filter.category, terms)
        }
      } else {
        if (filter?.term) {
          filterTerms.set(filter.category, [
            getFilterTerm(filter.location, filter.term?.value)
          ])
        } else if (filter?.range) {
          filterTerms.set(filter.category, [
            getFilterRange(filter.location, filter.range)
          ])
        }
      }
    })
  const baseQueryParams = {
    chainIds,
    nestedQuery,
    esPaginationOptions: {
      from: (page - 1 || 0) * (offset || 21),
      size: offset >= 0 ? offset : 21
    },
    sortOptions: sort && { sortBy: sort, sortDirection },
    staticFilters: Array.from(filterTerms.values())
  } as BaseQueryParams

  return generateBaseQuery(baseQueryParams)
}

export interface AggregationQuery {
  [x: string]: { terms: { field: string; size?: number } }
}

export interface AggregationResult {
  category: string
  keywords: Array<Keyword>
}

export interface Keyword {
  label: string
  location?: string
  filter: Filter
  count: number
}

export interface AggregationResultUI {
  static: AggregationResult[]
  tags: Keyword[]
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
      label: 'Terms and Conditions',
      graphQLLabel: 'termsAndConditions',
      location: 'metadata.additionalInformation.termsAndConditions',
      size: 100
    },
    {
      label: 'Download Media Types',
      graphQLLabel: 'language',
      location: 'metadata.algorithm.language.keyword',
      size: 100
    },
    {
      label: 'Tags',
      graphQLLabel: 'tags',
      location: 'metadata.tags.keyword',
      size: 100
    },
    {
      label: 'Service Type',
      graphQLLabel: 'service',
      location: 'metadata.type.keyword',
      size: 100
    },
    {
      label: 'Access Type',
      graphQLLabel: 'access',
      location: 'services.type.keyword',
      size: 100
    },
    {
      label: 'Price',
      graphQLLabel: 'price',
      location: 'stats.price.value',
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
    page?: number
    offset?: number
    sort?: string
    sortDirection?: string
    filters?: Filter[]
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
    )}&`
  }
  urlLocation = urlLocation.slice(0, -1)
  return urlLocation
}

export function formatGraphQLResults(
  results: PagedAssets
): AggregationResult[] {
  const agg: [
    string,
    { buckets: { key: string; doc_count: number; key_as_string?: string }[] }
  ][] = Object.entries(results.aggregations)
  return agg.map((a) => {
    const metadata = getSearchMetadata().find((m) => m.graphQLLabel === a[0])
    return {
      category: metadata.label,
      keywords: a[1].buckets.map((b) => ({
        label: b.key_as_string ?? b.key,
        location: metadata.location,
        filter: {
          category: metadata.label,
          location: metadata.location,
          term: { value: b.key }
        },
        count: b.doc_count
      }))
    }
  })
}

export const formatTermsConditionsVerifiedResults = (
  aggregationResults: AggregationResult[]
): AggregationResult => {
  const termsConditionsVerified: AggregationResult[] =
    aggregationResults.filter(
      (ar: AggregationResult) =>
        ar.category === 'Is Verified' || ar.category === 'Terms and Conditions'
    )
  return {
    category: 'Verified and Terms & Conditions',
    keywords: termsConditionsVerified.flatMap((tcv: AggregationResult) => {
      if (tcv.keywords.length > 0) {
        const filters: Filter = {
          ...tcv.keywords[0].filter,
          category: 'Verified and Terms & Conditions',
          term: { value: 'true' }
        }
        if (
          tcv.keywords.find((a: Keyword): boolean => a.label === 'true') &&
          tcv.category === 'Is Verified'
        ) {
          tcv.keywords = [
            { ...tcv.keywords[0], label: 'verified', filter: filters }
          ]
        } else if (
          tcv.keywords.find((a: Keyword): boolean => a.label === 'true') &&
          tcv.category === 'Terms and Conditions'
        ) {
          tcv.keywords = [
            { ...tcv.keywords[0], label: 'terms & conditions', filter: filters }
          ]
        }
      }
      return tcv.keywords
    })
  }
}

export const formatPriceResults = (
  aggregationResults: AggregationResult[]
): AggregationResult => {
  const price: AggregationResult = aggregationResults.find(
    (ar: AggregationResult): boolean => ar.category === 'Price'
  )

  const free: Keyword = price.keywords
    .filter((k: Keyword): boolean => +k.label === 0)
    .reduce(
      (a: Keyword, b: Keyword): Keyword => {
        return {
          label: a.label,
          filter: {
            ...b.filter,
            category: a.filter.category,
            location: b.filter.location,
            term: { value: '0' }
          },
          count: a.count + b.count
        }
      },
      {
        label: 'free',
        filter: { category: 'Price', location: 'stats.price.value' },
        count: 0
      }
    )
  const paid: Keyword = price.keywords
    .filter((k: Keyword): boolean => +k.label > 0)
    .reduce(
      (a: Keyword, b: Keyword): Keyword => {
        return {
          label: a.label,
          filter: {
            category: a.filter.category,
            location: b.filter.location,
            range: [{ operation: 'gt', value: 0 }]
          },
          count: a.count + b.count
        }
      },
      {
        label: 'paid',
        filter: { category: 'Price', location: 'stats.price.value' },
        count: 0
      }
    )
  price.keywords = [free, paid].filter((p: Keyword): boolean => p.count !== 0)
  return price
}

export const formatLanguagesResults = (
  aggregationResults: AggregationResult[]
): AggregationResult => {
  const languages: AggregationResult = aggregationResults.find(
    (ar: AggregationResult): boolean => ar.category === 'Download Media Types'
  )
  languages.keywords = languages?.keywords.map((lang: Keyword): Keyword => {
    // Change the labels below
    if (lang.label.includes('Dockerfile')) {
      return { ...lang, label: (lang.label = 'custom docker image') }
    }
    if (lang.label === 'about:blank') {
      return { ...lang, label: (lang.label = 'no type') }
    }
    return lang
  })
  return languages
}

const formatAccessTypeResults = (
  aggregationResults: AggregationResult[]
): AggregationResult => {
  const accessTypes: AggregationResult = aggregationResults.find(
    (ar: AggregationResult): boolean => ar.category === 'Access Type'
  )
  accessTypes.keywords = accessTypes?.keywords.map(
    (accessType: Keyword): Keyword => {
      if (accessType.label === 'access') {
        return { ...accessType, label: (accessType.label = 'download') }
      }
      return accessType
    }
  )
  return accessTypes
}

export const formatUIResults = (results: PagedAssets): AggregationResultUI => {
  const aggregationResults: AggregationResult[] = formatGraphQLResults(results)

  const everythingElse: AggregationResult[] = aggregationResults.filter(
    (ar: AggregationResult) =>
      ar.category !== 'Is Verified' &&
      ar.category !== 'Terms and Conditions' &&
      ar.category !== 'Tags' &&
      ar.category !== 'Price' &&
      ar.category !== 'Download Media Types' &&
      ar.category !== 'Access Type'
  )

  return {
    static: [
      ...everythingElse,
      formatAccessTypeResults(aggregationResults),
      formatTermsConditionsVerifiedResults(aggregationResults),
      formatPriceResults(aggregationResults),
      formatLanguagesResults(aggregationResults)
    ],
    tags: aggregationResults.find(
      (ar: AggregationResult): boolean => ar.category === 'Tags'
    ).keywords
  }
}
