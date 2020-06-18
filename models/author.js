const mongoose = require('mongoose')

//similar to a table in SQL
const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Author',authorSchema)   //we passed it the name of the schema and the schema