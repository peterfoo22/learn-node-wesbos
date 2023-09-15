const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;



const reviewSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  store: {
    type: mongoose.Schema.ObjectId,
    ref: "Store",
  },
  text: {
    type: String
  },
  rating:{
    type: Number,
    min: 1,
    max: 5
  }
})


module.exports = mongoose.model('Review', reviewSchema);