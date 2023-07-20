import { getSearchMetadata } from '@components/Search/utils'

const getBucket = () => {
  const terms = getSearchMetadata()
  return terms.map((t) => `${t.graphQLLabel}: Aggregation\n`)
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
    ${getBucket()}
    total_doc_count: Int
}
  `
export default schema
