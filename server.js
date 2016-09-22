'use strict';
// require is not really global...
// var originalRequire = require;
// function myRequire(module) {
//   console.log(`require("${module})"`);
//   return originalRequire(module);
// }
//global.sayWhat = 'huh?';
//global.require = myRequire;

const express = require('express');

const app = express();
const chatCat = require('./app');
const passport = require('passport');

app.set('port', process.env.PORT || 3000);
app.use(express.static('public'));
app.set('views', './views'); // not needed as views is defualt...
app.set('view engine', 'ejs');

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

app.use('/', (req, res, next) => {
  console.log(` ${new Date()} - ${req.path}`);
  next();
});

app.use(chatCat.session);
app.use(passport.initialize());
app.use(passport.session());
app.use(require('morgan')('combined', {
  stream: {
    write: message => {
      chatCat.logger.log('info', message)
    }
  }
}));

app.use('/', chatCat.router);

chatCat.ioServer(app).listen(app.get('port'), () => {
  console.log(`ChatCat running on port ${app.get('port')}`);
});