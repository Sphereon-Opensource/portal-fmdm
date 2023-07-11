import { gql } from 'graphql-tag'

const typeDefs = gql`
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
    total_doc_count: Int
  }
`
export default typeDefs
