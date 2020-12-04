const express = require('express');
const socketio = require('socket.io');
const http = require('http');

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');

const PORT = process.env.PORT || 5000;

const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.on('connection', (socket) => {
    console.log(`new user connected: ${socket.id}`);
    socket.on('join', ({ name, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, name, room });

        if (error) return callback(error);

        ///////////////////////////////////////////////////////////////
        // 'message' - ADMIN GENERATED MESSAGES
        socket.emit('message', {
            user: 'admin',
            text: `${user.name}, welcome to the room ${user.room}`
        });

        // socket.broadcast - sends the message to everyone excecpt the specific users
        socket.broadcast.to(user.room).emit('message', {
            user: 'admin',
            text: `${user.name} has joined`
        });

        // socket.join - joins a user to a room
        socket.join(user.room);

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });

        callback(); // As we dont pass {error} the if error statement in front wont be triggered
    })

    ///////////////////////////////////////////////////////////////
    // 'sendMessage' - USER GENERATED MESSAGES
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);


        // io.to(room).emit
        io.to(user.room).emit('message', { user: user.name, text: message });
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });

        callback();
    });


    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('message', { user: 'admin', text: `${user.name} has left.` })
        }
    });
})

app.use(router);

server.listen(PORT, () => console.log(`Server has started in port ${PORT}`));