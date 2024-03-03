const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const Blog = require('../models/blog')
const helper = require('./test_helper')

const api = supertest(app)

let token = ''
const userLogin = { username: 'rootBlog', password: 'sekret' }

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

describe('when there is initially some blogs saved', () => {

    beforeEach(async () => {
        await User.deleteMany({})
        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'rootBlog', passwordHash })
        await user.save()

        const userObject = await User.findOne({ username: "rootBlog" })
        const userId = userObject._id.toString()

        await Blog.deleteMany({})
        const blogsWithUsers = helper.initialBlogs.map(blog => ({
            ...blog,
            user: userId
        }))
        await Blog.insertMany(blogsWithUsers)

        const response = await api
            .post('/api/login')
            .send(userLogin)
            .expect(200)

        token = 'Bearer ' + response.body.token
    })

    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('there is the right amount of blogs', async () => {
        const response = await api.get('/api/blogs')
        assert.strictEqual(response.body.length, helper.initialBlogs.length)
    })

    test('the titles include one about React patterns', async () => {
        const response = await api.get('/api/blogs')
        const titles = response.body.map(e => e.title)
        assert(titles.includes('React patterns'))

    })

    test('the id field is without underscore', async () => {
        const response = await api.get('/api/blogs')
        const firstBlog = response.body[0]
        assert.ok(firstBlog.hasOwnProperty('id'), 'Expected field id')
    })

    describe('blog can be added', () => {

        test('blog is added', async () => {
            const response = await api
                .post('/api/blogs')
                .send(helper.newBlog)
                .set('authorization', token)
                .expect(201)
                .expect('Content-Type', /application\/json/)
        })

        test('count increases by 1', async () => {
            await api
                .post('/api/blogs')
                .set('authorization', token)
                .send(helper.newBlog)

            const response = await api.get('/api/blogs')
            assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)
        })

        test('Title is correct', async () => {
            await api
                .post('/api/blogs')
                .set('authorization', token)
                .send(helper.newBlog)

            const response = await api.get('/api/blogs')
            const titles = response.body.map(e => e.title)
            assert(titles.includes('Node tricks'))
        })

        test('Number of likes is 0 by default', async () => {
            await api
                .post('/api/blogs')
                .set('authorization', token)
                .send(helper.newBlog)

            const response = await api.get('/api/blogs')
            const likes = response.body.map(e => e.likes)
            assert(likes.includes(0))
        })
    })

    describe('required fields are needed', () => {
        test('New blog without title results in 400', async () => {
            const newBlogNoTitle = {
                author: "John Smith",
                url: "https://google.com/"
            }
            await api
                .post('/api/blogs')
                .set('authorization', token)
                .send(newBlogNoTitle)
                .expect(400)

            const response = await api.get('/api/blogs')
            assert.strictEqual(response.body.length, helper.initialBlogs.length)
        })

        test('New blog without url results in 400', async () => {
            const newBlogNoUrl = {
                title: "Node tricks",
                author: "John Smith"
            }
            await api
                .post('/api/blogs')
                .set('authorization', token)
                .send(newBlogNoUrl)
                .expect(400)

            const response = await api.get('/api/blogs')
            assert.strictEqual(response.body.length, helper.initialBlogs.length)
        })
    })

    describe('blog is deleted', () => {
        test('A Blog can be deleted', async () => {
            const blogsAtStart = await helper.blogsInDb()
            const id = blogsAtStart[0].id
            await api
                .delete(`/api/blogs/${id}`)
                .set('authorization', token)
                .expect(204)

            const response = await api.get('/api/blogs')
            assert.strictEqual(response.body.length, helper.initialBlogs.length - 1)
        })
    })

    describe('blog is updated', () => {
        test('A Blogs likes can be updated', async () => {
            const blogsAtStart = await helper.blogsInDb()
            const blog = blogsAtStart[0]
            blog.likes++
            const id = blog.id
            const response = await api
                .put(`/api/blogs/${id}`)
                .send(blog)

            assert.deepStrictEqual(response.body.likes, blog.likes)
        })

        test('A Blogs title can be updated', async () => {
            const blogsAtStart = await helper.blogsInDb()
            console.log("täällä", blogsAtStart)
            const blog = blogsAtStart[0]
            blog.title = 'this title is so creative wow'
            const id = blog.id
            const response = await api
                .put(`/api/blogs/${id}`)
                .send(blog)

            assert.notDeepStrictEqual(response.body.title, 'React patterns')
            assert.deepStrictEqual(response.body.title, blog.title)
        })
    })
})

after(async () => {
    await mongoose.connection.close()
})