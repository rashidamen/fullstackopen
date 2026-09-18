const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')
const { PubSub } = require('graphql-subscriptions')
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')
const pubsub = new PubSub()
const badInput = (error) => new GraphQLError(
  error.code === 11000 ? 'That title, author, or username already exists' : error.message,
  { extensions: { code: 'BAD_USER_INPUT' } },
)
const authenticate = (context) => {
  if (!context.currentUser) throw new GraphQLError('not authenticated', { extensions: { code: 'UNAUTHENTICATED' } })
}
module.exports = {
  Query: {
    bookCount: async () => Book.countDocuments(),
    authorCount: async () => Author.countDocuments(),
    allBooks: async (_root, { author, genre }) => {
      const filter = {}
      if (genre != null) filter.genres = genre
      if (author != null) {
        const found = await Author.findOne({ name: author })
        if (!found) return []
        filter.author = found._id
      }
      return Book.find(filter).populate('author')
    },
    allAuthors: async () => {
      // Two queries regardless of the number of authors: avoids n+1 counts.
      const [authors, counts] = await Promise.all([
        Author.find({}), Book.aggregate([{ $group: { _id: '$author', count: { $sum: 1 } } }]),
      ])
      const byId = new Map(counts.map(item => [String(item._id), item.count]))
      return authors.map(author => ({ ...author.toObject(), id: author.id, bookCount: byId.get(author.id) || 0 }))
    },
    me: (_root, _args, context) => context.currentUser || null,
  },
  Author: {
    bookCount: async (author) => author.bookCount ?? Book.countDocuments({ author: author._id || author.id }),
  },
  Mutation: {
    addBook: async (_root, args, context) => {
      authenticate(context)
      try {
        // Validate before creating an author so invalid input leaves no orphan.
        const authorCandidate = new Author({ name: args.author })
        await authorCandidate.validate()
        const book = new Book({ ...args, author: authorCandidate._id })
        await book.validate()
        if (await Book.exists({ title: book.title })) throw new Error('A book with this title already exists')
        let author = await Author.findOne({ name: authorCandidate.name })
        if (!author) {
          try { author = await authorCandidate.save() }
          catch (error) {
            if (error.code !== 11000) throw error
            author = await Author.findOne({ name: authorCandidate.name })
          }
        }
        book.author = author._id
        await book.save()
        await book.populate('author')
        await pubsub.publish('BOOK_ADDED', { bookAdded: book })
        return book
      } catch (error) { throw badInput(error) }
    },
    editAuthor: async (_root, { name, setBornTo }, context) => {
      authenticate(context)
      try { return await Author.findOneAndUpdate({ name }, { born: setBornTo }, { new: true, runValidators: true }) }
      catch (error) { throw badInput(error) }
    },
    createUser: async (_root, args) => {
      try { return await User.create(args) }
      catch (error) { throw badInput(error) }
    },
    login: async (_root, { username, password }) => {
      const user = await User.findOne({ username })
      // Shared password is explicitly required by this course exercise.
      if (!user || password !== 'secret') throw new GraphQLError('login failed: wrong credentials', { extensions: { code: 'BAD_USER_INPUT' } })
      return { value: jwt.sign({ username: user.username, id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' }) }
    },
    _resetDatabase: async () => {
      if (process.env.NODE_ENV !== 'test') throw new GraphQLError('_resetDatabase is only available in test mode')
      await Book.deleteMany({})
      await Author.deleteMany({})
      await User.deleteMany({})
      return true
    },
  },
  Subscription: { bookAdded: { subscribe: () => pubsub.asyncIterableIterator('BOOK_ADDED') } },
}
