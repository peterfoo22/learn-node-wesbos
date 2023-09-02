const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');


const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please Enter a Store Name'
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  tags: [String],
  created:{
    type: Date,
    default: Date.now
  },
  location:{
    type:{
      type: String,
      default: 'Point'
    },
    coordinates:[{
        type: Number,
        required: 'You Must Suppply Coodrinates'
      }],
    address:  {
      type: String,
      required: "You Must Supply an Address"
    }
  }
})

storeSchema.pre('save', function(next){
  if(!this.isModified('name')){
    next();
    return;
  }
  this.slug = slug(this.name);
  next();
})

module.exports = mongoose.model('Store', storeSchema);