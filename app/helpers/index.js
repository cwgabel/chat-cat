'use strict';
let router = require('express');
router = new router.Router();

const db = require('../db');
const crypto = require('crypto');

//
function registerRoutes(routes, method) {
  for (const key in routes) {
    if (typeof routes[key] === 'object' && routes[key] !== null && !(routes[key] instanceof Array)) {
      registerRoutes(routes[key], key);
    } else {
      // register routes
      if (method === 'get') {
        router.get(key, routes[key]);
      } else if (method === 'post') {
        router.post(key, routes[key]);
      } else {
        router.use(routes[key]);
      }
    }
  }
}

function route(routes) {
  registerRoutes(routes);
  return router;
}

const findOne = profileID => {
  return db.userModel.findOne({
    'profileId': profileID
  });
};

const createNewUser = profile => {
  return new Promise((resolve, reject) => {
    const newChatUser = new db.userModel({
      profileId: profile.id,
      fullName: profile.displayName,
      profilePic: profile.photos[0].value || ''
    });
 
    newChatUser.save(error => {
      if (error) {
        reject(error);
      } else {
        resolve(newChatUser);
      }
    });
  });
}

// promises version
const findById = id => {
  return new Promise((resolve, reject) => {
    db.userModel.findById(id, (error, user) => {
      if (error) {
        reject(error);
      } else {
        resolve(user);
      }
    });
  });
};

// check user
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    console.log("authentication accepted");
    next();
  } else {
    console.log("authentication rejected");
    res.redirect('/');
  }
};

// Find chatroom by a name
const findRoomByName = (allrooms, room) => {
  let findRoom = allrooms.findIndex((element, index, array) => {
    if (element.room === room) {
      return true;
    } else {
      return false
    }
  });
  return findRoom > 1 ? true : false;
};

// generate unique roomID
const randomHex = () => {
  return crypto.randomBytes(24).toString('hex');
};

// find a chatroom by id
const findRoomById = (allrooms, roomID) => {
  return allrooms.find((element, index, array) => {
    if (element.roomID === roomID) {
      return true;
    } else {
      return false;
    }
  });
}

// add user to chatroom
const addUserToRoom = (allrooms, data, socket) => {
  // Get the room object

  let getRoom = findRoomById(allrooms, data.roomID);
  if (getRoom !== undefined) {

    // Get the active user's ID (ObjectID as used in session)
    let userID = socket.request.session.passport.user;

    // Check to see if this user already exists in the chatroom
    let checkUser = getRoom.users.findIndex((element, index, array) => {
      if (element.userID === userID) {
        return true;
      } else {
        return false;
      }
    });

    // remove user if already present
    if (checkUser > -1) {
      getRoom.users.splice(checkUser, 1);
    }

    // add user
    getRoom.users.push({
      socketID: socket.id,
      userID,
      user: data.user,
      userPic: data.userPic
    });

    // join the room channel 
    socket.join(data.roomID);

    //return updated room object
    return getRoom;
  }
}

// if found
const removeUserFromRoom = (allrooms, socket) => {
  for (let room of allrooms) {
    // find the user
    let findUser = room.users.findIndex((element, index, array) => {
      if (element.socketID === socket.id) {
        return true;
      } else {
        return false;
      }
      //return  
    });

    if (findUser > -1) {
      socket.leave(room.roomID);
      room.users.splice(findUser, 1);
      return room;
    }
  }
}

module.exports = {
  route,
  findOne,
  createNewUser,
  findById,
  isAuthenticated,
  findRoomByName,
  randomHex,
  findRoomById,
  addUserToRoom,
  removeUserFromRoom
};