require('dotenv').config({ quiet: true })
const http = require('node:http')
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const { ApolloServer } = require('@apollo/server')
const { expressMiddleware } = require('@as-integrations/express5')
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const { WebSocketServer } = require('ws')
const { useServer } = require('graphql-ws/use/ws')
const User = require('./models/user')
const typeDefs = require('./schema')
const resolvers = require('./resolvers')

async function start() {
  if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) throw new Error('Set MONGODB_URI and JWT_SECRET in library-backend/.env')
  await mongoose.connect(process.env.MONGODB_URI)
  await Promise.all([require('./models/book').init(), require('./models/author').init(), User.init()])
  const app = express()
  const httpServer = http.createServer(app)
  const schema = makeExecutableSchema({ typeDefs, resolvers })
  const wsServer = new WebSocketServer({ server: httpServer, path: '/' })
  const cleanup = useServer({ schema }, wsServer)
  const server = new ApolloServer({ schema, plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    { async serverWillStart() { return { async drainServer() { await cleanup.dispose() } } } },
  ] })
  await server.start()
  app.use('/', cors(), express.json(), expressMiddleware(server, {
    context: async ({ req }) => {
      const authorization = req.headers.authorization || ''
      let currentUser = null
      if (authorization.toLowerCase().startsWith('bearer ')) {
        try {
          const decoded = jwt.verify(authorization.slice(7), process.env.JWT_SECRET)
          currentUser = await User.findById(decoded.id)
        } catch { /* Invalid or expired credentials act as an anonymous request. */ }
      }
      return { currentUser }
    },
  }))
  const port = Number(process.env.PORT) || 4000
  await new Promise(resolve => httpServer.listen(port, resolve))
  console.log(`Server ready at http://localhost:${port}`)
  const stop = async () => { await server.stop(); await mongoose.disconnect(); process.exit(0) }
  process.on('SIGTERM', stop)
  process.on('SIGINT', stop)
}
start().catch(error => { console.error(error.message); process.exit(1) })
