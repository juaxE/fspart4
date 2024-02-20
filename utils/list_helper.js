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
    const reducer = (current, candidate) => {
        const { likes: likesCurrent } = current
        const { likes: likesCandidate } = candidate
        return likesCurrent >= likesCandidate ? current : candidate
    }
    const result = blogs.reduce(reducer, {})

    if (Object.keys(result).length === 0) {
        return 'No blogs or likes'
    }
    const { title, author, likes } = result
    return { title, author, likes }
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
}