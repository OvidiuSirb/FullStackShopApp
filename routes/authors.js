const express=require('express')
// const { request, response } = require('express')
const router = express.Router()
const Author = require('../models/author')

//All Authors Route
router.get('/',async (request, response) => {
    let searchOptions = {}

    //request.query instead of request.body because a get request sends information to the query string, a POST request send it through the body
    if(request.query != null && request.query.name !== ''){
        searchOptions.name = new RegExp(request.query.name, 'i')    //case insensitive
    }
    try{
        const authors = await Author.find(searchOptions)   //get all the authors
        response.render('authors/index',{
            authors: authors,
            searchOptions: request.query
        })
    }catch{
        response.redirect('/')
    }
})

//New Author Route, with variables that are going to be sent to our ejs file
router.get('/new',(request, response) => {
    response.render('authors/new',{author: new Author()})       //this is going to give us acces to the author model
})

//Create Author Route, instead of rendering we're doing creation
router.post('/', async (request,response) =>{
    // response.send('Create')
    const author = new Author({
        name: request.body.name
    })

    try{
        //it's going to wait for author.save to finish and it's going to populate this newAuthor variable as soon as it's done saving the author
        const newAuthor = await author.save()
        //TODO
        // response.redirect(`authors/${newAuthor.id}`)
        response.redirect(`authors`)
    }catch{
        let locals = {
                        author: author,
                        errorMessage: 'Error creating Author'
                    }
        response.render('authors/new', locals)
    }


    // //we'll use async-await for this one instead of nesting a lot of if else statements
    // author.save((err, newAuthor) => {
    //     if (err) {
    //         //we pass the author so that if it entered in a name already, it will be repopulated into the value to not re-enter it
    //         let locals = {
    //             author: author,
    //             errorMessage: 'Error creating Author'
    //         }
    //         response.render(`authors/new`, locals)
    //     }else{
    //         //TODO
    //         // response.redirect(`authors/${newAuthor.id}`)
    //         response.redirect(`authors`)
            

    //     }
    // })
    // response.send(request.body.name)
})

module.exports = router