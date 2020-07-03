const express=require('express')
// // const multer=require('multer')
// const path = require('path')
// const fs = require('fs')        //file system library to delete the book cover that we don't need anymore
const router = express.Router()
const Author = require('../models/author')
const Book = require('../models/book')
const { request } = require('express')
const { render } = require('ejs')
const e = require('express')
// const uploadPath = path.join('public', Book.coverImageBasePath)
const imageMimeTypes =['image/jpeg', 'image/png', 'image/gif'] //array with image types
// destination some kind of upload path inside of our project; callback to call whenever we're done with our actual fileFilter
// const upload = multer({
//     dest: uploadPath,
//     fileFilter: (request, file, callback) => {
//         callback(null, imageMimeTypes.includes(file.mimetype))
//     }
// })

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

//Show Book Route
router.get('/:id', async (req,res) =>{
    try{
        const book = await Book.findById(req.params.id)
            .populate('author')
            .exec()
        res.render('books/show', {book: book})
    }catch{
        res.redirect('/')
    }
})

//Edit Book Route
router.get('/:id/edit',async (request, response) => {
    try{
        const book = await Book.findById(request.params.id)
        renderEditPage(response, book)
    }catch{
        response.redirect('/')
    }
})

//Create Book Route
// removed upload.single('cover') because we're not uploading a file, we're now getting a string & we have run 'npm uninstall multer'
router.post('/',  async (request,response) =>{
    // response.send('Create Book')
    // const fileName = request.file != null ? request.file.filename : null

    //deleted coverImageName: fileName, and oommented fileName above
    const book = new Book({
        title: request.body.title,
        author: request.body.author,
        publishDate: new Date(request.body.publishDate),
        pageCount: request.body.pageCount,
        description: request.body.description
    })

    saveCover(book, request.body.cover)

    try{
        const newBook = await book.save()
        // response.redirect('books')
        response.redirect(`books/${newBook.id}`)

    }catch{
        // if(book.coverImageName != null){
        //     removeBookCover(book.coverImageName)
        // }
        // removeBookCover(book.coverImageName)
        renderNewPage(response, book, true)
    }
})

// function removeBookCover(fileName){
//     //removes the file from our server; we don't need it anymore as we store the files into the database
//     fs.unlink(path.join(uploadPath, filename), err => {
//         if(err) console.error(err)
//     })
// }

//Update Book Route
router.put('/:id',  async (request,response) =>{
    let book

    try{
        book = await Book.findById(request.params.id)
        book.title = request.body.title
        book.author = request.body.author
        book.publishDate = new Date(request.body.publishDate)
        book.pageCount = request.body.pageCount 
        book.description = request.body.description
        if(request.body.cover != null && request.body.cover != ''){
            saveCover(book, request.body.cover)
        }
        await book.save()
        response.redirect(`/books/${book.id}`)

    }catch(err){
        console.log(err)
        if(book != null){
            renderEditPage(response, book, true)
        }
        else{
            redirect('/')
        }
    }
})

//Delete Book page
router.delete('/:id', async (req,res) => {
    let book
    try{
        const book = await Book.findById(req.params.id)
        await book.remove()
        res.redirect('/books')
    }catch{
        if (book != null){
            res.render('books/show',{
                errorMessage: 'Could not remove book'
            })
        } else{
            res.redirect('/')
        }
    }
})

async function renderNewPage(response, book, hasError = false){
    renderFormPage(response, book, 'new', hasError)
}


async function renderEditPage(response, book, hasError = false){
    renderFormPage(response, book, 'edit', hasError)
}


async function renderFormPage(response, book, form, hasError = false){
    try{
        const authors = await Author.find({})
        let locals={
            authors: authors,
            book: book
        }
        if(hasError) {
            if(form==='edit'){
                locals.errorMessage = 'Error Updating Book'
            }
            else{
            locals.errorMessage = 'Error Creating Book' }}
        response.render(`books/${form}`,locals)
    }catch{
        response.redirect('/books')
    }
}

function saveCover(book, coverEncoded){
    if(coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if(cover != null && imageMimeTypes.includes(cover.type)){   //"type" is from the JSON
        book.coverImage = new Buffer.from(cover.data, 'base64') //the string is base64 encoded
        book.coverImageType = cover.type
    }
}
module.exports = router