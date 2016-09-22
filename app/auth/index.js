'use strict';
const passport = require('passport');
const config = require('../config');
const helper = require('../helpers');
const logger = require('../logger');
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;

module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    // find user
    helper.findById(id)
      .then(user => done(null, user))
      .catch(error => logger.log('error', 'Error when deserialing user: ' + error));
  });

  const authProcessor = (accessToken, refreshToken, profile, done) => {
    // find user
    // if found, return data via done()
    // otherwise create one
    helper.findOne(profile.id)
      .then(result => {
        if (result) {
          done(null, result);
        } else {
          // create 
          helper.createNewUser(profile)
            .then(newChatUser => done(null, newChatUser))
            .catch(error => logger.log('error', 'Error when creating new user:' + error));
        }
      });
  };

  passport.use(new FacebookStrategy(config.fb, authProcessor));
  passport.use(new TwitterStrategy(config.twitter, authProcessor));
};