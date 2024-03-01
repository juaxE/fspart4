const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper')

const api = supertest(app)


describe('when there is initially some notes saved', () => {
    beforeEach(async () => {
        await Blog.deleteMany({})
        await Blog.insertMany(helper.initialBlogs)
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
                .expect(201)
                .expect('Content-Type', /application\/json/)
        })

        test('count increases by 1', async () => {
            await api
                .post('/api/blogs')
                .send(helper.newBlog)

            const response = await api.get('/api/blogs')
            assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)
        })

        test('Title is correct', async () => {
            await api
                .post('/api/blogs')
                .send(helper.newBlog)

            const response = await api.get('/api/blogs')
            const titles = response.body.map(e => e.title)
            assert(titles.includes('Node tricks'))
        })

        test('Number of likes is 0 by default', async () => {
            await api
                .post('/api/blogs')
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
                .expect(204)

            const response = await api.get('/api/blogs')
            assert.strictEqual(response.body.length, helper.initialBlogs.length - 1)
        })
    })

    describe('blog is updated', () => {
        test('A Blogs likes can be updated', async () => {
            const blogsAtStart = await helper.blogsInDb()
            const existingBlog = blogsAtStart[0]
            existingBlog.likes++
            const id = existingBlog.id
            const response = await api
                .put(`/api/blogs/${id}`)
                .send(existingBlog)

            assert.deepStrictEqual(response.body, existingBlog)
        })
    })
})

after(async () => {
    await mongoose.connection.close()
})
