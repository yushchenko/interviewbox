var OPENTOK_API_KEY = '16265011',
    OPENTOK_API_SECRET = '1aab123ae8944978f4b193377827d4c1bc93c1eb';

var host = 'localhost',
    port = 8081,
    io = require('socket.io').listen(port),
    opentok = require('opentok'),
    ot = new opentok.OpenTokSDK(OPENTOK_API_KEY, OPENTOK_API_SECRET);

var interviews = {}; // keeping all interviews in memory

function joinInterview(interviewId, newParticipant, callback) {

    var token = ot.generateToken({
        connection_data: 'u_' + newParticipant.participantId,
        role: 'publisher'
    });

    var interview = interviews[interviewId];

    if (interview) { // Interview exists, returning just adding participant
        callback(interview, token);
        return;
    }

    // Creating new interview

    interview = {
        interviewId: interviewId,
        apiKey: OPENTOK_API_KEY
    };

    ot.createSession(host, {}, function(sessionId) {

        interview.sessionId = sessionId;
        interviews[interviewId] = interview;

        callback(interview, token);
    });
}

io.sockets.on('connection', function (socket) {


    socket.on('join', function(joinRequest) {

        joinInterview(joinRequest.interviewId, joinRequest.newParticipant, function (interview, token) {
            socket.emit('hello', { interview: interview, token: token });
        });
    });

    socket.on('disconnect', function() {
        console.log('user disconnected');
    });
    
});