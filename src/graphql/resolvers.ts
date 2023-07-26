import appConfig from '../../app.config'
import {
  AggregationResult,
  formatGraphQLResults,
  getResults
} from '@components/Search/utils'

const deprecatedNetworks: number[] = [3, 4]

export const getChainIds = async (): Promise<number[]> => {
  const { chainIds } = appConfig
  return chainIds.filter((id) => !deprecatedNetworks.includes(id))
}

const resolvers = {
  Query: {
    aggregations: async (): Promise<AggregationResult[]> => {
      const results = await getResults(
        {
          faceted: true,
          offset: 0
        },
        await getChainIds()
      )
      return formatGraphQLResults(results)
    }
  }
}

export default resolvers
