'use strict';
const config = require('../config');
const logger = require('../logger');
const Mongoose = require('mongoose').connect(config.dbURI);

// log error 
Mongoose.connection.on('error', error => {
  logger.log('error', `MongoDB connection error: ${error}`);
});

Mongoose.connection.on('connected', () => {
  logger.log('info', "MongoDB connected");
});

const chatUser = new Mongoose.Schema({
  profileId: String,
  fullName: String,
  profilePic: String
});

const userModel = Mongoose.model('chatUser', chatUser);

module.exports = {
  Mongoose,
  userModel
};