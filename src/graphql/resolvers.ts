import appConfig from '../../app.config'
import { getResults } from '@components/Search/utils'
import axios from 'axios'

export const getChainIds = async (): Promise<number[]> => {
  const { chainIds } = appConfig
  return chainIds.filter((id) => id !== 3 && id !== 4)
}

export const getCancelToken = () => {
  const axiosSource = {
    current: axios.CancelToken.source()
  }
  if (axiosSource.current) axiosSource.current.cancel()
  return axiosSource.current.token
}

const resolvers = {
  Query: {
    aggregations: async () =>
      (
        await getResults(
          {
            faceted: 'true',
            offset: '0'
          },
          await getChainIds()
        )
      ).aggregations
  }
}

export default resolvers
