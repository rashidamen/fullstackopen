const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')

describe('addition of a new user', () => {

    beforeEach(async () => {
        await User.deleteMany({})
    })

    test('succeeds with a fresh username', async () => {
        const usersAtStart = await User.find({})

        const newUser = {
            username: 'root',
            name: 'Superuser',
            password: 'mypassword',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await User.find({})
        assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        assert(usernames.includes(newUser.username))
    })

    test('fails if username is too short', async () => {
        const newUser = {
            username: 'uk',
            password: 'mypassword',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        assert.ok(result.body.error.includes('shorter than the minimum allowed length'))
    })

    test('fails if password is too short', async () => {
        const newUser = {
            username: 'username',
            password: 'pw', // too short
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        assert.ok(result.body.error.includes('password must be at least 3 characters long'))
    })

    test('fails if username is not unique', async () => {
        const newUser = {
            username: 'root',
            password: 'mypassword',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)
    })
})

after(async () => {
    await mongoose.connection.close()
})
