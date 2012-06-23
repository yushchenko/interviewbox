window.addEventListener('load', function() {

     var socket = io.connect('http://localhost:8081/');

     socket.on('welcome', function (data) {
         console.log(data);
     });

     socket.emit('publish', 'my code');

});
