const mongoose = require('mongoose')
const schema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, minlength: 3, trim: true },
  favoriteGenre: { type: String, required: true, trim: true },
})
module.exports = mongoose.model('User', schema)
