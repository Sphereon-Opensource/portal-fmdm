import { ApolloServer } from '@apollo/server'
import { startServerAndCreateNextHandler } from '@as-integrations/next'
import { NextApiRequest, NextApiResponse } from 'next'

import typeDefs from '../../../graphql/schema.mjs'
import resolvers from '@graphql/resolvers'

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers
})

const handler = startServerAndCreateNextHandler(apolloServer, {
  context: async (req: NextApiRequest, res: NextApiResponse) => ({ req, res })
})

export default handler
