const { promisify } = require('es6-promisify');
const mongoose = require('mongoose');
const User = mongoose.model('User');


exports.loginForm = (req, res) =>{
  res.render('login', {title: "Login Form"})
}

exports.registerForm = (req, res) =>{
  res.render('register', {title: 'Register'});
}

exports.validateRegister = (req, res, next) =>{
  req.sanitizeBody('name');
  req.checkBody('name', "You must supply a name!").notEmpty();
  req.checkBody('email', "Email is not valid").isEmail();
  req.sanitizeBody('email').normalizeEmail({
    remote_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false
  });
  req.checkBody('password', 'Password cannot be blank').notEmpty();
  req.checkBody('confirm_password', 'Oops! Your passwords do not match').equals(req.body.password);
  const errors = req.validationErrors();
  if(errors){
    req.flash('error', errors.map(err=>err.msg));
    res.render('register', {title: "Register", body: req.body, flashes: req.flash()})
  }
}

exports.registerUser = async(req,res, next) =>{
  const user = new User({email: req.body.email, name: req.body.name, password: req.body.password })
  await user.save();
  res.redirect('/')
  next();
}

exports.accounts = (req, res)=>{
  res.render('editAccount', {title: 'Edit Your Acount'})
}

exports.updateAccount =(req, res)=>{
  const updates = {
    name: req.body.name,
    email: req.body.email
  }

  // const user = await = User.findOneandUpdate(
  //   {$set: updates},
  //   {new: true, runValidators: true, content: 'query'}
  // )

  res.render(req.body)
}


