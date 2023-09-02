const mongoose = require('mongoose');
const Store = mongoose.model('Store');

exports.homePage = (req, res) =>{
  res.render('index');
}

exports.addStore = (req, res) =>{
  res.render('editStore',{"title": "Add Store"})
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

  req.flash('success', `Succesfully Updated <strong>${store.name}</strong>. <a href =/stores/${store.id}/>View Store -></a>`)
  res.redirect(`/stores/${store.id}/edit`);
}