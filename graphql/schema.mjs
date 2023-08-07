const schema = `
type Query {
    aggregations: [Aggregation]
}

type Keyword {
    label: String
    location: String
    count: Int
}

type Aggregation {
  category: String
  keywords: [Keyword]
}
`
export default schema
