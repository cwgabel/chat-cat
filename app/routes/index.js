'use strict';
const helper = require('../helpers');
const passport = require('passport');
const config = require('../config');

module.exports = () => {
  const routes = {
    'get': {
      '/': (req, res, next) => {
        res.render('login', {
          pageTitle: 'My Login Page'
        });
      },
      '/rooms': [helper.isAuthenticated, (req, res, next) => {
        res.render('rooms', {
          user: req.user,
          host: config.host
        });
      }],
      '/chat/:id': [helper.isAuthenticated, (req, res, next) => {
        const getRoom = helper.findRoomById(req.app.locals.chatrooms, req.params.id);
        if (getRoom === undefined) {
          console.log(" not found", getRoom);
          return next();
        } else {
          console.log("render chatroom here");
          res.render('chatroom', {
            user: req.user,
            host: config.host,
            room: getRoom.room,
            roomID: getRoom.roomID
          });
        }
      }],
      '/auth/facebook': passport.authenticate('facebook'),
      '/auth/facebook/callback': passport.authenticate('facebook', {
        successRedirect: '/rooms',
        failureRedirect: '/'
      }),
      '/auth/twitter': passport.authenticate('twitter'),
      '/auth/twitter/callback': passport.authenticate('twitter', {
        successRedirect: '/rooms',
        failureRedirect: '/'
      }),
      '/logout': (req, res, next) => {
        req.logout();
        res.redirect('/');
      }
    },
    'post': {},
    'NA': (req, res, next) => {
      res.status(404).sendFile(`${process.cwd()}/views/404.htm`);
    }
  };

  return helper.route(routes);
};