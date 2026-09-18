import { ApolloClient, HttpLink, InMemoryCache, split } from '@apollo/client'
import { SetContextLink } from '@apollo/client/link/context'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient } from 'graphql-ws'
const uri = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:4000/'
const http = new HttpLink({ uri })
const auth = new SetContextLink(({ headers }) => {
  const token = localStorage.getItem('library-token')
  return { headers: { ...headers, authorization: token ? `Bearer ${token}` : '' } }
})
const ws = new GraphQLWsLink(createClient({ url: uri.replace(/^http/, 'ws') }))
export const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: split(({ query }) => {
    const definition = getMainDefinition(query)
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
  }, ws, auth.concat(http)),
})
// Invalidate every filtered variant, including inactive recommendation queries.
export function refreshLibrary(client) {
  client.cache.evict({ id: 'ROOT_QUERY', fieldName: 'allBooks' })
  client.cache.evict({ id: 'ROOT_QUERY', fieldName: 'allAuthors' })
  client.cache.gc()
  return client.refetchQueries({ include: ['AllBooks', 'AllAuthors'] })
}
