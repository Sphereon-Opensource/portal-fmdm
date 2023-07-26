interface EsPaginationOptions {
  from?: number
  size?: number
}

interface BaseQueryParams {
  chainIds: number[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nestedQuery?: any
  esPaginationOptions?: EsPaginationOptions
  sortOptions?: SortOptions
  aggs?: any
  filters?: FilterTerm[]
  staticFilters?: (FilterTerm | FilterRange)[][]
  ignorePurgatory?: boolean
  ignoreState?: boolean
}
