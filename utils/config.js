require('dotenv').config()

let MONGO_URL = process.env.MONGO_URL
const PORT = 3003

module.exports = {
    MONGO_URL,
    PORT
}