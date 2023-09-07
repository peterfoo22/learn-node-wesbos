const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer')
const jimp = require('jimp')

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
  const store = new Store(req.body);
  await store.save();
  req.flash('success', `Successfully Created! - ${store.name}. Care to leave a review?` )
  res.redirect(`/store/${store.slug}`);
}

exports.getStores = async (req, res)=>{
  const stores = await Store.find();
  res.render('stores', {"title": "Stores", stores});
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

  const store = await Store.findOne({slug: req.params.id});
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