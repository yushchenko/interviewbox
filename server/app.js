var port = 8081,
    io = require('socket.io').listen(port);

io.sockets.on('connection', function (socket) {

    socket.on('disconnect', function() {
        console.log('user disconnected');
    });

    socket.on('publish', function(data) {
        console.log(data);
    });

    socket.emit('welcome', 'hi here!');
});