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
  },
  photo: String,
  author: {
    type: mongoose.Schema.ObjectId, 
    ref: 'User',
    required: "You must supply an author"
  },
},{
    toJSON:{virtuals: true},
    toObject:{virtuals: true},
})

storeSchema.index({
  name: 'text',
  description: 'text',
})

storeSchema.pre('save', async function(next){
  if(!this.isModified('name')){
    next();
    return;
  }
  this.slug = slug(this.name);

  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)`, 'i')

  const storesWithSlug = await this.constuctor.find({slug: slugRegEx})

  if(storesWithSlug.length){
    this.slug = `${this.slug} - ${storesWithSlug.length + 1}`;
  }

  next();
})


storeSchema.statics.getTagsList = function(){
  return this.aggregate([
    {$unwind: '$tags'},
    {$group:{_id: '$tags', count: {$sum:1}}},
    {$sort: {count: -1}}
  ]);
}

storeSchema.statics.getTopStores = function(){
  return this.aggregate([
   { $lookup: {from: 'reviews', localField: '_id', foreignField:'store', as: 'reviews' }}, 
   {$match: {'reviews.1': {$exists: true}}},
   {$project: {
    photo: '$$ROOT.photo',
    name: '$$ROOT.name',
    slug: '$$ROOT.slug',
    reviews: '$$ROOT.reviews',
    averageRating: {$avg: '$reviews.rating'}
   } 
  },
  {$sort: {avg: -1} },
  {$limit: 10}
  ])
}

storeSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'store' //which field on the the review
})

function autopopulate(next){
  this.populate('reviews');
  next();
}

storeSchema.pre('find', autopopulate);
storeSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Store', storeSchema);