var express = require('express');
var router = express.Router();
var User = require('../models/users')
var bcrypt = require('bcryptjs')

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('login', { csrfToken: req.csrfToken() });
});

router.post('/', function (req, res, next) {
  User.findOne({ email: req.body.email }, function (err, user) {
    if (!user) {
      res.render('login', { error: 'Invalid email or password' });
    } else {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        req.session.user = user;
        res.redirect('/dashboard')
      } else {
        res.render('login', { error: "Invalid email or password" })
      }
    }

  })
});

module.exports = router;
