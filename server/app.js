var port = 8081,
    io = require('socket.io').listen(port);

io.sockets.on('connection', function (socket) {


    socket.on('join', function(joinRequest, callback) {
        
        console.log(joinRequest);

        callback('interview');
    });

    socket.on('disconnect', function() {
        console.log('user disconnected');
    });
    
});