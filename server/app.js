var host = 'interviewbox.yushchenko.name',
    port = 8081;

var OPENTOK_API_KEY = '16265011',
    OPENTOK_API_SECRET = '1aab123ae8944978f4b193377827d4c1bc93c1eb';

var fs = require('fs'),
    app = require('express').createServer(),
    io = require('socket.io').listen(app),
    opentok = require('opentok'),
    ot = new opentok.OpenTokSDK(OPENTOK_API_KEY, OPENTOK_API_SECRET);
       
var interviews = {}; // keeping all interviews in memory

function joinInterview(interviewId, participantId, callback) {

    var token = ot.generateToken({
        connection_data: participantId,
        role: 'publisher'
    });

    var interview = interviews[interviewId];

    if (interview) { // Interview exists

        interview.drafts[participantId] = interview.source;

        callback(interview, token);
        return;
    }

    // Creating new interview and TB session

    var source = getDefaultSource();
    interview = {
        interviewId: interviewId,
        apiKey: OPENTOK_API_KEY,
        source: source,
        drafts: { participantId: source } // by participantId
    };

    ot.createSession(host, {}, function(sessionId) {

        interview.sessionId = sessionId;
        interviews[interviewId] = interview;

        callback(interview, token);
    });
}

function getInterview(interviewId) {
    return interviews[interviewId];
}

function getDefaultSource() {
    return fs.readFileSync('default.html', 'utf-8');
}

//------------------------------------------------------------------------------

app.listen(port);

app.get('/draft/:interviewId/:participantId', function (req, res) {

    var interview = getInterview(req.params.interviewId),
        draft = interview.drafts[req.params.participantId];

    res.send(draft);
});

var socketsByInterview = {};

io.sockets.on('connection', function (socket) {

    var interviewId, participantId;

    socket.on('join', function(joinRequest) {

        interviewId = joinRequest.interviewId;
        participantId = joinRequest.participantId;

        if (!socketsByInterview[interviewId]) {
            socketsByInterview[interviewId] = [];
        }
        socketsByInterview[interviewId].push(socket);

        joinInterview(interviewId, participantId, function (interview, token) {
            socket.emit('hello', { interview: interview, token: token });
        });
    });

    socket.on('updatedraft', function(draft, fn) {
        getInterview(interviewId).drafts[participantId] = draft;
        fn();
    });

    socket.on('updatesource', function(source) {

        var interview = getInterview(interviewId);

        interview.source = source;

        var sockets = socketsByInterview[interviewId], i;
        for (i = 0; i < sockets.length; i += 1) {
            if (sockets[i] === socket) {
                continue;
            }
            sockets[i].emit('updatesource', source);
        }
    });
});