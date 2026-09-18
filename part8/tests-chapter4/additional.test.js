const { test, before, after, beforeEach } = require('node:test')
const assert = require('node:assert/strict')
const { setupDatabase, teardownDatabase, seedDatabase, createTestUser, createServer, Author } = require('./test_helper')
const resolvers = require('../library-backend/resolvers')
let server
before(async () => { await setupDatabase(); server = createServer() })
beforeEach(seedDatabase)
after(teardownDatabase)
test('author and genre filters work together, including an unknown author', async () => {
  const query = 'query($author: String, $genre: String) { allBooks(author: $author, genre: $genre) { title } }'
  const response = await server.executeOperation({ query, variables: { author: 'Robert Martin', genre: 'refactoring' } })
  assert.equal(response.body.singleResult.errors, undefined)
  assert.deepEqual(response.body.singleResult.data.allBooks.map(b => b.title), ['Clean Code'])
  const missing = await server.executeOperation({ query, variables: { author: 'Missing Author' } })
  assert.equal(missing.body.singleResult.data.allBooks.length, 0)
})
test('author counts are correct and do not query once per author', async () => {
  const mongoose = require('../library-backend/node_modules/mongoose')
  let queries = 0
  mongoose.set('debug', () => { queries += 1 })
  try {
    const response = await server.executeOperation({ query: '{ allAuthors { name bookCount } }' })
    assert.equal(response.body.singleResult.errors, undefined)
    assert.equal(response.body.singleResult.data.allAuthors.find(a => a.name === 'Robert Martin').bookCount, 2)
    assert.equal(queries, 2)
  } finally { mongoose.set('debug', false) }
})
test('bookAdded delivers a saved book with its author', async () => {
  const currentUser = await createTestUser()
  const iterator = resolvers.Subscription.bookAdded.subscribe()
  const next = iterator.next()
  try {
    const response = await server.executeOperation({ query: 'mutation { addBook(title: "Subscription book", author: "New Author", published: 2026, genres: ["test"]) { id } }' }, { contextValue: { currentUser } })
    assert.equal(response.body.singleResult.errors, undefined)
    const event = await next
    assert.equal(event.value.bookAdded.title, 'Subscription book')
    assert.equal(event.value.bookAdded.author.name, 'New Author')
  } finally { await iterator.return() }
})
test('invalid books do not create an unused author', async () => {
  const currentUser = await createTestUser()
  const response = await server.executeOperation({ query: 'mutation { addBook(title: "Ab", author: "Unused Author", published: 2026, genres: []) { id } }' }, { contextValue: { currentUser } })
  assert.ok(response.body.singleResult.errors)
  assert.equal(await Author.findOne({ name: 'Unused Author' }), null)
})
test('database reset is unavailable outside test mode', async () => {
  const previous = process.env.NODE_ENV
  process.env.NODE_ENV = 'production'
  try {
    const response = await server.executeOperation({ query: 'mutation { _resetDatabase }' })
    assert.match(response.body.singleResult.errors[0].message, /only available in test mode/)
    assert.equal(await Author.countDocuments(), 4)
  } finally {
    if (previous === undefined) delete process.env.NODE_ENV
    else process.env.NODE_ENV = previous
  }
})
