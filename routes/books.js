const express=require('express')
const multer=require('multer')
const path = require('path')
const fs = require('fs')        //file system library to delete the book cover that we don't need anymore
const router = express.Router()
const Author = require('../models/author')
const Book = require('../models/book')
const { request } = require('express')
const { render } = require('ejs')
const uploadPath = path.join('public', Book.coverImageBasePath)
const imageMimeTypes =['image/jpeg', 'image/png', 'image/gif'] //array with image types
// destination some kind of upload path inside of our project; callback to call whenever we're done with our actual fileFilter
const upload = multer({
    dest: uploadPath,
    fileFilter: (request, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})

//All Books Route
router.get('/',async (request, response) => {
    //! not const query
    let query = Book.find()
    if (request.query.title != null && request.query.title != ''){
        query = query.regex('title', new RegExp(request.query.title,'i'))
    }
    if (request.query.publishedBefore != null && request.query.publishedBefore != ''){
        query = query.lte('publishDate', request.query.publishedBefore)
    }
    if (request.query.publishedAfter != null && request.query.publishedAfter != ''){
        query = query.gte('publishDate', request.query.publishedAfter)
    }
//     let query = Book.find()
//   if (request.query.title != null && request.query.title != '') {
//     query = query.regex('title', new RegExp(request.query.title, 'i'))
//   }
//   if (request.query.publishedBefore != null && request.query.publishedBefore != '') {
//     query = query.lte('publishDate', request.query.publishedBefore)
//   }
//   if (request.query.publishedAfter != null && request.query.publishedAfter != '') {
//     query = query.gte('publishDate', request.query.publishedAfter)
//   }
//   try {
//     const books = await query.exec()
//     response.render('books/index', {
//       books: books,
//       searchOptions: request.query
//     })
//   } catch {
//     response.redirect('/')
//   }
    try{
        const books = await query.exec()
        response.render('books/index',{
            books: books,
            searchOptions: request.query
        })
    }catch{
        response.redirect('/')
    }
    response.render('books/index', {
        books: books,
        searchParams: request.query
    })
})

//New Book Route
router.get('/new',async (request, response) => {
    // response.send('New Book')
    renderNewPage(response, new Book())
})

//Create Book Route
router.post('/', upload.single('cover'), async (request,response) =>{
    // response.send('Create Book')
    const fileName = request.file != null ? request.file.filename : null
    const book = new Book({
        title: request.body.title,
        author: request.body.author,
        publishDate: new Date(request.body.publishDate),
        pageCount: request.body.pageCount,
        coverImageName: fileName,
        description: request.body.description
    })

    try{
        const newBook = await book.save()
        response.redirect('books')
    }catch{
        if(book.coverImageName != null){
            removeBookCover(book.coverImageName)
        }
        removeBookCover(book.coverImageName)
        renderNewPage(response, book, true)
    }
})

function removeBookCover(fileName){
    //removes the file from our server
    fs.unlink(path.join(uploadPath, filename), err => {
        if(err) console.error(err)
    })
}

async function renderNewPage(response, book, hasError = false){
    try{
        const authors = await Author.find({})
        const book = new Book()
        let locals={
            authors: authors,
            book: book
        }
        if(hasError) locals.errorMessage = 'Error Creating Book'
        response.render('books/new',locals)
    }catch{
        response.redirect('/books')
    }
}
module.exports = router