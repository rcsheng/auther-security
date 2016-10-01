'use strict'; 

var router = require('express').Router();
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');

var User = require('../api/users/user.model');
var secrets = require('../../secrets');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));

router.use(session({
  secret: secrets.session,
  resave: false,
  saveUninitialized: false
}));

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id)
  .then(function (user) {
    done(null, user);
  })
  .catch(done);
});

router.use(passport.initialize());

router.use(passport.session());

module.exports = router;
