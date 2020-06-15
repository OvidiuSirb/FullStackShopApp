const express=require('express')
const router = express.Router()

//using the get action for the localhost:3000 and asociate it with a function
router.get('/',(request, response) => {
    // response.send('Hello World')
    response.render('index')//it renders our view (layouts/index.ejs)
})

module.exports = router