const getBucket = () => {
  const customFacetedSearch = process.env.NEXT_PUBLIC_DYNAMIC_FILTERS
  const props = customFacetedSearch ? customFacetedSearch.split(';') : []
  const terms = props.map((p) => p.split(','))
  return terms.map((b) => `${b[0]}: Aggregation\n`)
}

const schema = `
type Query {
    aggregations: Aggregations
}

type Bucket {
    key: String
    doc_count: Int
}

type Aggregation {
    buckets: [Bucket]
    doc_count_error_upper_bound: Int
    sum_other_doc_count: Int
}

type Aggregations {
    access: Aggregation
    service: Aggregation
    tags: Aggregation
    ${getBucket()}
    total_doc_count: Int
}
  `
export default schema
