const express=require('express')
const router = express.Router()
const Book = require('../models/book')

//using the get action for the localhost:3000 and asociate it with a function
router.get('/',async (request, response) => {
    // response.send('Hello World')
    let books
    try{
        books = await Book.find().sort({createAt: 'desc'}).limit(10).exec()
    }catch{
        books = []
    }
    response.render('index', {books: books})//it renders our view (layouts/index.ejs)
})

module.exports = router