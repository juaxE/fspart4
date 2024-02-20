const _ = require('lodash')

const dummy = (blogs) => {
    let length = blogs.length

    return 1
}

const totalLikes = (blogs) => {
    const reducer = (sum, item) => {
        const { likes } = item
        return sum + likes
    }
    return blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
    if (Object.keys(blogs).length === 0) {
        return 'No blogs or likes'
    }

    const reducer = (current, candidate) => {
        const { likes: likesCurrent } = current
        const { likes: likesCandidate } = candidate
        return likesCurrent >= likesCandidate ? current : candidate
    }
    const result = blogs.reduce(reducer, {})


    const { title, author, likes } = result
    return { title, author, likes }
}

const mostBlogs = (blogs) => {
    if (Object.keys(blogs).length === 0) {
        return 'No blogs or likes'
    }

    const blogsByAuthor = _.groupBy(blogs, 'author')

    const authorWithMostBlogs = _.maxBy(Object.keys(blogsByAuthor), (author) => blogsByAuthor[author].length)
    const numberOfBlogs = blogsByAuthor[authorWithMostBlogs].length

    return { author: authorWithMostBlogs, blogs: numberOfBlogs }
}

const mostLikedAuthor = (blogs) => {
    if (Object.keys(blogs).length === 0) {
        return 'No blogs or likes'
    }

    const blogsByAuthor = _.groupBy(blogs, 'author')

    const authorWithMostLikes = _.maxBy(Object.keys(blogsByAuthor), (author) => _.sumBy(blogsByAuthor[author], 'likes'))
    const numberOfLikes = _.sumBy(blogsByAuthor[authorWithMostLikes], 'likes')

    return { author: authorWithMostLikes, likes: numberOfLikes }
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikedAuthor
}