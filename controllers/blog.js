const blogRouter = require('express').Router()
const Blog = require('../models/blog')

blogRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({})
    response.json(blogs)
})

blogRouter.post('/', async (request, response) => {

    const blog = new Blog(request.body)
    try {
        const result = await blog.save()
        response.status(201).json(result)
    }
    catch {
        response.status(400).json(result)
    }
})

module.exports = blogRouter