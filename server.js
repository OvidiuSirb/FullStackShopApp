if(process.env.NODE_ENV !== 'production'){
    //load up some dependencies
    require('dotenv').config()       //.load() and parse() deprecated
}

const express = require('express')
//get the app portion by calling this function of Express
const app = express()
const expressLayouts= require('express-ejs-layouts')
const bodyParser = require('body-parser')


const indexRouter = require('./routes/index')
const authorRouter = require('./routes/authors')

//configuring our Express application
//set our view engine
app.set('view engine', 'ejs')
//set where our views will be coming from
app.set('views',__dirname + '/views')
//hook-up Express layouts
//the idea behind a layout file: every single file is going to be put inside this layout file so we don't have to duplicate all of the beginning HTML and ending HTML of our projects such as the header and the footer
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))   //where we put our HTML, JS, CSS, images,etc; folder with all of our public views
app.use(bodyParser.urlencoded({limit:'10mb', extended: false}))      //increasing the limit that our server can accept useful for uploading files to our server

//setting up our database
const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL,{
    useNewUrlParser: true
})          //we use an environment variable to not hardcode anything

const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))
 

app.use('/', indexRouter)
app.use('/authors',authorRouter)

app.listen(process.env.PORT || 3000) //pulled from an environment variable for when we deploy the server is going to tell us what port it is listening to; not us but for development were just going to default this to port 3000 since the server is not telling us anything for our hosting platform


