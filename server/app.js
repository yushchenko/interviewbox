var
    HOST = 'interviewbox.yushchenko.name',
    // HOST = 'localhost',
    PORT = 8081;

var app = require('express').createServer(),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    interviewManager = require('./interviewManager.js');

io.sockets.on('connection', function (socket) {

    socket.on('join', function(joinRequest) {

        var interviewId = joinRequest.interviewId,
            participantId = joinRequest.participantId,
            room = 'interview_' + interviewId;

        socket.join(room);

        // ? should be a better way to broadcast to everyone with exception yourself
        function broadcast(msg, data) {
            socket.leave(room); // to avoid sending message to yourself
            io.sockets.in(room).emit(msg, data);
            socket.join(room);
        }

        interviewManager.joinInterview(interviewId, participantId, function (interview, token) {

            socket.on('updatedraft', function(draft, fn) {
                interviewManager.getInterview(interviewId).drafts[participantId] = draft;
                fn();
            });
        
            socket.on('updatesource', function(source) {
                interview.source = source;
                broadcast('updatesource', source);
            });
        
            socket.on('startediting', function() {
                broadcast('startediting');
            });

            socket.emit('hello', { interview: interview, token: token });
        });
    });
});

// "src" for preview iframe
app.get('/draft/:interviewId/:participantId', function (req, res) {

    var interview = interviewManager.getInterview(req.params.interviewId);

    if (!interview || !interview.drafts[req.params.participantId]) {
        res.send(fs.readFileSync('default.html', 'utf-8'));
        return;
    }

    res.send(interview.drafts[req.params.participantId]);
});

// a naive way to preventing complete server crash on an uncaught exception
process.on('uncaughtException', function(err) {
    console.log('Uncaught exception: ' + err);
});

app.listen(PORT);