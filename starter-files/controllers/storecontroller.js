const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer')
const jimp = require('jimp');
const User = require('../models/User');

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next){
    const isPhoto = file.mimetype.startsWith('image/');
    if(isPhoto){
      next(null, true);
    }else{
      next({message: 'That filetype isn\'t allowed'}, false)
    }
  }
}

exports.homePage = (req, res) =>{
  res.render('index');
}

exports.upload = multer(multerOptions).single('photo');

exports.addStore = (req, res) =>{
  res.render('editStore',{"title": "Add Store"})
}

exports.resize = async (req, res, next) =>{
  if(!req.file){
    next()
    return;
  }
  const extension = req.file.mimtype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extension}`

  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO );
  await photo.write(`./public/uploads/${req.body.photo}`);
  next();
}

exports.createStore = async (req, res) =>{
  req.body.author = req.user._id;
  const store = new Store(req.body);
  await store.save();
  req.flash('success', `Successfully Created! - ${store.name}. Care to leave a review?` )
  res.redirect(`/store/${store.slug}`);
}

exports.getStores = async (req, res)=>{
  const page = req.params.page || 1;
  const limit = 6;
  const skip = (page * limit) - limit

  const storesPromise = Store
  .find().skip(skip).limit(limit);

  const countPromise = Store.count();

  const [stores, count] = await Promise.all([storesPromise, countPromise]);
 
  const pages = Math.ceil(count / limit); 

  if(!stores.length && skip){
    req.flash('info', "Hey you asked for page that doesn't exist")
    res.redirect((`/stores/page/${pages}`))
  }
 
  res.render('stores', {"title": "Stores", stores, count, pages, page});
}

const confirmOwner =(store, user)=>{
  if(!store.author.equals(user._id)){
    throw Error('You must own store to edit it');
  }
}

exports.editStore = async (req, res) =>{
  const store = await Store.findOne({_id: req.params.id});
  res.render('editStore', {title:`Edit Store ${store.name}`, store})
}

exports.updateStore = async (req, res) =>{
  const store = await Store.findOneAndUpdate(
    {_id: req.params.id}, req.body, {new: true, runValidators: true}
  ).exec();

  req.flash('success', `Succesfully Updated <strong>${store.name}</strong>. <a href =/store/${store.id}/>View Store -></a>`)
  res.redirect(`/stores/${store.id}/edit`);
}

exports.getOneStore = async (req, res, next)=>{

  const store = await Store.findOne({slug: req.params.id}).populate('author reviews');
  if(!store){
    return next();
  }
  res.render('oneStore', {store: store} );
}

exports.getStoresByTag = async (req, res) =>{
  const tag = req.params.tag;
  const tagQuery = tag || {$exists: true}
  const tagsPromise =  Store.getTagsList();
  const storesPromise = Store.find({tags:tagQuery});
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);

  res.render('tag',{tags, title: "Tags", tag, stores})
}

exports.searchStores = async(req, res)=>{
  const stores = await Store.find({
    $text:{
      $search: req.query.q
    }
  },
  {
    score: {
      $meta: 'textScore'
    }
  }).sort({
    score: {$meta:'textScore'}
  }).limit(5);

  res.json(stores);
}

exports.heartStore = async (req, res) =>{
  console.log(req.user)
  const hearts = req.user.hearts.map(obj => obj.toString());
  const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet';
  const user = await User
  .findByIdandUpdate(req.user.id, {
    [operator]: {hearts: req.params.id}},
    {new: true}
  )
  console.log(hearts)
  res.json(hearts);
}

exports.getTopStores = async (req, res) =>{
  const stores = await Store.getTopStores();
  // res.json(stores)
  res.render('topStores', {stores, title: "Top Stores"})
}