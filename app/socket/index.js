'use strict';
const helper = require('../helpers');

module.exports = (io, app) => {
  const allrooms = app.locals.chatrooms;

  io.of('/roomslist').on('connection', socket => {
    
    socket.on('getChatrooms', () => {
      socket.emit('chatRoomsList', JSON.stringify(allrooms));
    });

    socket.on('createNewRoom', newRoomInput => {
      //
      // check if room already exists, create and broadcast 
      if (!helper.findRoomByName(allrooms, newRoomInput)) {
      // create new room
        allrooms.push({
          room: newRoomInput,
          roomID: helper.randomHex(),
          users: []
        });

        // Emit list to creator
        socket.emit('chatRoomsList', JSON.stringify(allrooms));
        // Emit updated list to everyone 
        socket.broadcast.emit('chatRoomsList', JSON.stringify(allrooms));
      }
    });
  });

  
  io.of('/chatter').on('connection', socket => {
    // join
    socket.on('join', data => {
      const usersList = helper.addUserToRoom(allrooms, data, socket);
      console.log('usersList', usersList);
      // update the list of all active users
      socket.broadcast.to(data.roomID).emit('updateUsersList', JSON.stringify(usersList.users));
      socket.emit('updateUsersList', JSON.stringify(usersList.users));
    });

    // when a socket exits
    socket.on('disconnect', () => {
      //find room 
      let room = helper.removeUserFromRoom(allrooms, socket);
      socket.broadcast.to(room.roomID).emit('updateUsersList', JSON.stringify(room.users));
    })

    // when msg arrives
    socket.on('newMessage', data => {
      socket.to(data.roomID).emit('inMessage', JSON.stringify(data));
    });
  });

};