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

module.exports = {
    dummy,
    totalLikes
}