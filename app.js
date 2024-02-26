const http = require('http')
const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const config = require('./utils/config')
const blogRouter = require('./controllers/blog')



const mongoUri = config.MONGO_URI
mongoose.connect(mongoUri)

app.use(cors())
app.use(express.json())
app.use('/api/blogs', blogRouter)


module.exports = app