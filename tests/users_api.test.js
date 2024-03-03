const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const helper = require('./test_helper')

const api = supertest(app)

describe('when there is initially one user at db', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', passwordHash })

        await user.save()
    })

    test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'mluukkai',
            name: 'Matti Luukkainen',
            password: 'salainen',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        assert(usernames.includes(newUser.username))
    }),

        describe('invalid users aren\'t added', async () => {
            test('users without username aren\'t added', async () => {
                const usersAtStart = await helper.usersInDb()

                const newUser = {
                    username: '',
                    name: 'Matti Luukkainen',
                    password: 'salainen',
                }

                await api
                    .post('/api/users')
                    .send(newUser)
                    .expect(401)
                    .expect('Content-Type', /application\/json/)

                const usersAtEnd = await helper.usersInDb()
                assert.strictEqual(usersAtEnd.length, usersAtStart.length)
            }),
                test('users without password aren\'t added', async () => {
                    const usersAtStart = await helper.usersInDb()

                    const newUser = {
                        username: 'tero',
                        name: 'Matti Luukkainen',
                        password: '',
                    }

                    await api
                        .post('/api/users')
                        .send(newUser)
                        .expect(401)
                        .expect('Content-Type', /application\/json/)

                    const usersAtEnd = await helper.usersInDb()
                    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
                }),
                test('users with too short password aren\'t added', async () => {
                    const usersAtStart = await helper.usersInDb()

                    const newUser = {
                        username: 'tero',
                        name: 'Matti Luukkainen',
                        password: 'aa',
                    }

                    await api
                        .post('/api/users')
                        .send(newUser)
                        .expect(401)
                        .expect('Content-Type', /application\/json/)

                    const usersAtEnd = await helper.usersInDb()
                    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
                }),
                test('users with too short username aren\'t added', async () => {
                    const usersAtStart = await helper.usersInDb()

                    const newUser = {
                        username: 'te',
                        name: 'Matti Luukkainen',
                        password: 'aaa',
                    }

                    await api
                        .post('/api/users')
                        .send(newUser)
                        .expect(401)
                        .expect('Content-Type', /application\/json/)

                    const usersAtEnd = await helper.usersInDb()
                    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
                })
        })
})

after(async () => {
    await mongoose.connection.close()
})