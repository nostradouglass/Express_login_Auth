var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var Users = require('./models/users');
var bcrypt = require('bcryptjs');
var helmet = require('helmet');
var compression = require('compression');
var sessions = require('client-sessions');
var User = require('./models/users');
var csurf = require('csurf');

var index = require('./routes/index');
var users = require('./routes/users');
var login = require('./routes/login');
var register = require('./routes/register');
var dashboard = require('./routes/dashboard');

mongoose.connect('mongodb://admin:doritos5!@ds135876.mlab.com:35876/auth_practice', { useMongoClient: true});
mongoose.connection.on('connect', function () {
  console.log('connected to database');
})

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(helmet())
app.use(compression())
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sessions({
  cookieName: 'session',
  secret: 'jklfdmkl34890jnnse9ds83k230sddsjk',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
  httpOnly: true
}));

app.use(function (req, res, next) {
  if (req.session && req.session.user) {
    User.findOne({ email: req.session.user.email }, function (err, user) {
      if (user) {
        req.user = user
        delete req.user.password
        req.session.user = user
        res.locals.user = user
      }
      next()
    })
  } else {
    next()
  }
});

function requireLogin(req, res, next) {
  if (!req.user) {
    res.redirect('/');
  } else {
    next();
  }
}

app.use(csurf());

app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true,
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

// If user is logged in then allow static path to be shown.
app.use('/static', requireLogin, express.static(path.join(__dirname, 'test')));

app.use('/', index);
app.use('/users', users);
app.use('/login', login);
app.use('/register', register);
app.use('/dashboard', requireLogin, dashboard);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
