const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')

const initialBlogs = [
    {
        title: 'React patterns',
        author: 'Michael Chan',
        url: 'https://reactpatterns.com/',
        likes: 7,
    },
    {
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
        likes: 5,
    },
]

beforeEach(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash, name: 'Superuser' })
    const savedUser = await user.save()

    const blogsWithUser = initialBlogs.map(blog => ({ ...blog, user: savedUser._id }))
    await Blog.insertMany(blogsWithUser)
})

describe('when there is initially some blogs saved', () => {
    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('all blogs are returned', async () => {
        const response = await api.get('/api/blogs')
        assert.strictEqual(response.body.length, initialBlogs.length)
    })

    test('the unique identifier property of the blog posts is named id', async () => {
        const response = await api.get('/api/blogs')
        const firstBlog = response.body[0]
        assert.ok(firstBlog.id)
        assert.strictEqual(firstBlog._id, undefined)
    })
})

describe('addition of a new blog', () => {
    test('a valid blog can be added', async () => {
        const loginResponse = await api
            .post('/api/login')
            .send({ username: 'root', password: 'sekret' })
            .expect(200)

        const token = loginResponse.body.token

        const newBlog = {
            title: 'Canonical string reduction',
            author: 'Edsger W. Dijkstra',
            url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
            likes: 12,
        }

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const response = await api.get('/api/blogs')
        const titles = response.body.map(r => r.title)

        assert.strictEqual(response.body.length, initialBlogs.length + 1)
        assert(titles.includes('Canonical string reduction'))
    })

    test('if likes property is missing from the request, it defaults to 0', async () => {
        const loginResponse = await api
            .post('/api/login')
            .send({ username: 'root', password: 'sekret' })
            .expect(200)

        const token = loginResponse.body.token

        const newBlog = {
            title: 'First class tests',
            author: 'Robert C. Martin',
            url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
        }

        const response = await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        assert.strictEqual(response.body.likes, 0)
    })

    test('if title is missing, response is 400 Bad Request', async () => {
        const loginResponse = await api
            .post('/api/login')
            .send({ username: 'root', password: 'sekret' })

        const token = loginResponse.body.token

        const newBlog = {
            author: 'Robert C. Martin',
            url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
            likes: 10
        }

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(400)
    })

    test('if url is missing, response is 400 Bad Request', async () => {
        const loginResponse = await api
            .post('/api/login')
            .send({ username: 'root', password: 'sekret' })

        const token = loginResponse.body.token

        const newBlog = {
            title: 'First class tests',
            author: 'Robert C. Martin',
            likes: 10
        }

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(400)
    })

    test('adding a blog fails with status 401 if token is not provided', async () => {
        const newBlog = {
            title: 'Type wars',
            author: 'Robert C. Martin',
            url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
            likes: 2,
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(401)
    })
})

describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid and user is creator', async () => {
        const loginResponse = await api
            .post('/api/login')
            .send({ username: 'root', password: 'sekret' })
            .expect(200)

        const token = loginResponse.body.token

        const blogsAtStart = await api.get('/api/blogs')
        const blogToDelete = blogsAtStart.body[0]

        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(204)

        const blogsAtEnd = await api.get('/api/blogs')
        assert.strictEqual(blogsAtEnd.body.length, initialBlogs.length - 1)

        const titles = blogsAtEnd.body.map(r => r.title)
        assert(!titles.includes(blogToDelete.title))
    })
})

describe('updating a blog', () => {
    test('succeeds with valid data', async () => {
        const blogsAtStart = await api.get('/api/blogs')
        const blogToUpdate = blogsAtStart.body[0]

        const updatedData = { likes: 100 }

        const response = await api
            .put(`/api/blogs/${blogToUpdate.id}`)
            .send(updatedData)
            .expect(200)

        assert.strictEqual(response.body.likes, 100)
    })
})

after(async () => {
    await mongoose.connection.close()
})
