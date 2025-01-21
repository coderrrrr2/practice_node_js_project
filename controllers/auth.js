const { name } = require('ejs');
const User = require('../models/user');
const bycrypt = require('bcryptjs');
const colorLog = require('../util/custom_log');


exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: false,
    errorMessage: message

  });
};


exports.getSignUp= (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signUp', {
    path: '/signUp',
    pageTitle: 'Sign Up',
    isAuthenticated: false,
    errorMessage: message
  });
}

exports.postSignUp = async (req, res, next)  => {
  const email = req.body.email;
  const  password = req.body.password;
  
User.findOne(  {where: { email: email }}
).then( async users => {
  if(users){
    console.log('User already exists');
    return res.redirect('/signUp');
  }
  const hashedPassword = await  bycrypt.hash(password, 12);
    User.create( 
      {
      name: 'test',
      email: email,
      password: hashedPassword
    }
  ).then(result => {
      result.save();
      console.log('User Created');
      res.redirect('/login');
    }).catch(err => {
      res.redirect('/signUp');

      console.log(err);
    });
  });
}

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  User.findOne({where: { email: email }})
    .then(user => {
      if (!user) {
        return res.redirect('/login');
      }
      bycrypt.compare(req.body.password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {

              res.redirect('/');
            });
          }
          res.redirect('/login');
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login');
        });
     
    })
    .catch(err => {
      console.log(err);
      res.redirect('/login');
    });
};


exports.logout = (req,res,next) =>{
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
}

exports.getResetPassword = (req,res,next) =>{
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message
  });
}

exports.resetPassword = (req,res,next) =>{
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
}
