module.exports.disconnectHandler = function(socket, client, users) {
    console.log(client.id + " disconnected :(");
    for (var i = 0, len = users.length; i < len; i++) {
        if (users[i].id === client.id) {
            users.splice(i, 1);
        }
    }
    console.log(users.length + " users left");
};