var Game = require('../lib/game');
var users = [];

module.exports = function(io) {
    io.on('connection', function(socket) {
        users.push(socket);
        console.log("connection by " + socket.id);
        socket.emit('test', "this is a message to connection #" + users.length);

        io.to(socket.id).emit('test', "this is just for you, " + socket.id);
        socket.broadcast.emit('test', "Hi guys, I'm " + socket.id);

        socket.on('disconnect', function() {
            Game.disconnectHandler(io, socket, users);
        });
    });
};