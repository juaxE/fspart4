const http = require('http')
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')



const blogSchema = mongoose.Schema({
    title: String,
    author: String,
    url: String,
    likes: Number
})

require('dotenv').config()
let MONGO_URL = process.env.MONGO_URL



const mongoUrl = MONGO_URL
mongoose.connect(mongoUrl)

const Blog = mongoose.model('Blog', blogSchema)

app.use(cors())
app.use(express.json())

app.get('/api/blogs', (request, response) => {
    Blog
        .find({})
        .then(blogs => {
            response.json(blogs)
        })
})

app.post('/api/blogs', (request, response) => {
    console.log(request.body)
    const blog = new Blog(request.body)
    console.log(blog)
    blog
        .save()
        .then(result => {
            response.status(201).json(result)
        })
})

const PORT = 3003
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})