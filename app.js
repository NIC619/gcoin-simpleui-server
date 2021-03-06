require('./db');
var mongoose = require('mongoose');
var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
//var logger = require('morgan');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var engine = require('ejs-mate');

var port_num = process.env.PORT || 4000;

var index = require('./routes/index');
var blockinfo = require('./routes/blockinfo');
var commands = require('./routes/commands');
var tx = require('./routes/tx');
var wallet = require('./routes/wallet');
var license = require('./routes/license');
var futures = require('./routes/futures');
var tokenize = require('./routes/tokenize');

var app = express();

// view engine setup
app.engine('ejs' , engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret: 'myencrypt' , resave: false , saveUninitialized: false}));//  session
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/blockinfo' , blockinfo);
app.use('/command',commands);
app.use('/tx',tx);
app.use('/wallet',wallet);
app.use('/license',license);
app.use('/futures',futures);
app.use('/tokenize',tokenize);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.listen(port_num, function(){
  console.log('listen on port' + port_num);
});
