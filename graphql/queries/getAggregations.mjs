const getAggregations = `
query getAggregations {
    aggregations {
        category
        keywords {
            label
            location
            count
        }
    }
}
`
export default getAggregations
