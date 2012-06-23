(function (window) {

    var host = 'localhost',
        port = '8081';

    function getJoinRequestFromHash() {

        var re = /#(\w+)\/(\w+)/,
            result = re.exec(window.location.hash);

        if (!result) {
            return null;
        }

        return {
            interviewId: result[1],
            participantId: result[2]
        };
    }

    // Chat --------------------------------------------------------------------

    function initChat(interview, token) {

        TB.setLogLevel(TB.DEBUG);

        var session = TB.initSession(interview.sessionId),
            chatContainer = document.getElementById('chatContainer'),
            i;

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

    // Editor ------------------------------------------------------------------

    function initEditor(config) {

        var editor = CodeMirror(
                document.getElementById('editor'),
                { mode: 'text/html', tabMode: 'indent' }
            );

        var iframe = document.getElementById('testFrame'),
            checkButton = document.getElementById('checkButton'),
            shareButton = document.getElementById('shareButton');

        function updateEditor(source) {
            editor.setValue(source || config.source);
        }

        function updatePreview() {
            iframe.src = 'http://' + host + ':' + port + '/draft/' +
                         config.interviewId + '/' + config.participantId;
        }

        function checkDraft() {
            config.onCheckDraft(editor.getValue());
        }

        function shareSource() {
            config.onShareSource(editor.getValue());
        }

        checkButton.addEventListener('click', checkDraft);
        shareButton.addEventListener('click', shareSource);

        updateEditor();
        updatePreview();

        return {
            updateEditor: updateEditor,
            updatePreview: updatePreview
        };
    }

    // Initialization ----------------------------------------------------------

    function start() {

        var joinRequest = getJoinRequestFromHash(),
            chat, editor;

        if (!joinRequest) {
            alert('To join to an interview type URL in the following format: \n\ninterviewbox.yushchenko.name/#[interviewId]/[candidate|interviewer]/[you name]');
            return;
        }

        var socket = io.connect('http://localhost:8081/');

        socket.on('connect', function() {
            socket.emit('join', joinRequest);
        });

        socket.on('hello', function(data) {

            initChat(data.interview, data.token);

            editor = initEditor({
                source: data.interview.source,
                interviewId: joinRequest.interviewId,
                participantId: joinRequest.participantId,

                onCheckDraft: function(draft) {
                    socket.emit('updatedraft', draft, function() {
                        editor.updatePreview();
                    });
                },

                onShareSource: function(source) {
                    socket.emit('updatesource', source);
                }
            });
        });

        socket.on('updatesource', function(source) {
            editor.updateEditor(source);
        });
    }

    window.onload = start;

})(window);
