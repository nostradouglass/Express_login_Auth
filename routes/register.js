var express = require('express');
var router = express.Router();
var User = require('../models/users')
var bcrypt = require('bcryptjs')

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('register', { csrfToken: req.csrfToken() });
});


/* Post register new User page. */
router.post('/', function (req, res, next) {
    var hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));

    var user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        userName: req.body.userName,
        email: req.body.email,
        password: hash
    });
    user.save(function (err) {
        if (err) {
            var err = 'Something bad happened, try again'
            if (err.code == 1000) {
                error = "That email address is already taken, try another."
            }
            res.render('register', { error: err });
        } else {
            res.redirect('/login')
        }
    })

});

module.exports = router;
