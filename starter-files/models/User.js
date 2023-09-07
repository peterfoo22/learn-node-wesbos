
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const validator = require('validator');
const passportLocalMongoose = require('passport-local-mongoose');


const userSchema = new Schema({
  email:{
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, "Invalid Email Address"],
    required: 'Please Supply Email Address '
  },
  name:{
    type: String,
    required: 'Please supply a Name',
    trim: true
  }
})


module.exports = mongoose.model('User', userSchema);

