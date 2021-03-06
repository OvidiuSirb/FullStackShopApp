const mongoose = require('mongoose')
// const path = require('path')

// const coverImageBasePath = 'uploads/bookCovers'

//similar to a table in SQL
    // instead of some idtype, we're using this reference of another object, this is telling mongoose that this reference is another object inside of our collections
    //ref string must match the name given at the mongoose.model('Author')
//changed coverImage to type Buffer, the image will be a buffer of the data representing our entire image now
const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    publishDate: {
        type: Date,
        required: true
    },
    pageCount:{
        type: Number,
        require: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    coverImage: {
        type: Buffer, 
        required: true
    },
    coverImageType: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Author'
    }
})

//virtual allows us to create a virtual property; which will act the same as any of the properties of the book above, but will actually derive its value from these variables
//we are using a normal function instead of a normal function because we are need the 'this' property
bookSchema.virtual('coverImagePath').get(function(){
    if(this.coverImage != null && this.coverImageType != null){
        //path library 
        // return path.join('/', coverImageBasePath, this.coverImageName)
        return `data:${this.coverImageType};charset=utf-8;base64,${
            this.coverImage.toString('base64')}`
    }
}) 

module.exports = mongoose.model('Book',bookSchema)   //we passed it the name of the schema and the schema
// module.exports.coverImageBasePath = coverImageBasePath//we don't want to export it as a default, we want it as a named variable