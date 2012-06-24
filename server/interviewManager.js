// provides storage for interview data 
// and works with OpenTok API

var
    HOST = 'interviewbox.yushchenko.name'//,
    // HOST = 'localhost'
    ;

var OPENTOK_API_KEY = '16265011',
    OPENTOK_API_SECRET = '1aab123ae8944978f4b193377827d4c1bc93c1eb';

var fs = require('fs'),
    opentok = require('opentok'),
    ot = new opentok.OpenTokSDK(OPENTOK_API_KEY, OPENTOK_API_SECRET);
       
function getDefaultSource() {
    return fs.readFileSync('default.html', 'utf-8');
}

// All interviews are stored in memory
var interviews = {}; 

exports.joinInterview = function (interviewId, participantId, callback) {

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

    var source = fs.readFileSync('default.html', 'utf-8');
    interview = {
        interviewId: interviewId,
        apiKey: OPENTOK_API_KEY,
        source: source,
        drafts: { participantId: source } // by participantId
    };

    ot.createSession(HOST, {}, function(sessionId) {

        interview.sessionId = sessionId;
        interviews[interviewId] = interview;

        callback(interview, token);
    });
};

exports.getInterview = function (interviewId) {
    return interviews[interviewId];
};
