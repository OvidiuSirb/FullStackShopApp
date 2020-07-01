const mongoose = require('mongoose')
const Book = require('./book')

//similar to a table in SQL
const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

authorSchema.pre('remove', function(next){
    Book.find({author: this.id}, (err, books)=>{
        if(err){
            next(err)
        }else if(books.length > 0){
            next(new Error('This author has book still'))
        }else{
            next()
        }
    })
})

module.exports = mongoose.model('Author',authorSchema)   //we passed it the name of the schema and the schema