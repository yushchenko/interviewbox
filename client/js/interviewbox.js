(function (window) {

    var chatContainer,
        session;

    function getJoinRequestFromHash() {

        var re = /#(\w+)\/(\w+)\/(\w+)/,
            result = re.exec(window.location.hash);

        if (!result) {
            return null;
        }

        return {
            interviewId: result[1],
            newParticipant: { role: result[2], name: result[3] }
        };
    }


    function subscribeToStreams(streams) {

        var element, id, s, i;

        for (i = 0; i < streams.length; i += 1) {

            s = streams[i];

            if (s.connection.connectionId === session.connection.connectionId) {
                continue;
            }

            element = document.createElement('div');
            id = 's_' + s.streamId;
            element.setAttribute('id', id);
            chatContainer.appendChild(element);

            session.subscribe(s, id);
        }
    }

    function initChat(interview, token) {

        var i;

        session = TB.initSession(interview.sessionId);
        session.addEventListener('sessionConnected', function (e) {
            
            var element, publisher;

            publisher = TB.initPublisher(interview.apiKey, 'publisher');
            session.publish(publisher);

            subscribeToStreams(e.streams);
        });

        session.addEventListener('streamCreated', function(e) {
            subscribeToStreams(e.streams);
        });

        session.connect(interview.apiKey, token);
    }

    function start() {

        var joinRequest = getJoinRequestFromHash();

        if (!joinRequest) {
            alert('To join to an interview type URL in the following format: \n\ninterviewbox.yushchenko.name/#[interviewId]/[candidate|interviewer]/[you name]');
            return;
        }
        chatContainer = document.getElementById('chatContainer');

        var socket = io.connect('http://localhost:8081/');

        TB.setLogLevel(TB.DEBUG);

        socket.on('connect', function() {
            socket.emit('join', joinRequest);
        });

        socket.on('hello', function(data) {
            initChat(data.interview, data.token);
        });

        socket.on('join', function(participant) { 

        });

        socket.on('leave', function(participant) {

        });
    }

    window.onload = start;

})(window);
