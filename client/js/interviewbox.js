(function (window) {

    var host = 'interviewbox.yushchenko.name',
        //host = 'localhost',
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
            i,
            videoParams = { height: 150, width: 200 };

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

                session.subscribe(s, id, videoParams);
            }
        }

        session.addEventListener('sessionConnected', function (e) {
            
            var element, publisher;

            publisher = TB.initPublisher(interview.apiKey, 'publisher', videoParams);
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

        var isEditing = false, isUpdate = false;

        var editor = CodeMirror(
                document.getElementById('editor'),
                {
                    mode: 'text/html',
                    tabMode: 'indent',
                    onChange: function() {

                        if (isEditing || isUpdate) return;

                        config.onStartEditing();
                        isEditing = true;
                    }
                }
            );

        var iframe = document.getElementById('testFrame'),
            checkButton = document.getElementById('checkButton'),
            shareButton = document.getElementById('shareButton'),
            editingMessage = document.getElementById('editingMessage');


        function updateEditor(source) {
            isUpdate = true;
            editor.setValue(source || config.source);
            isUpdate = false;
            isEditing = false;
        }

        function updatePreview() {
            iframe.src = 'http://' + host + ':' + port + '/draft/' +
                         config.interviewId + '/' + config.participantId;
        }

        function setEditing(editing) {
            shareButton.style.display = editing ? 'none' : 'block';
            editingMessage.style.display = editing ? 'block' : 'none';
        }

        checkButton.addEventListener('click', function() {
            config.onCheckDraft(editor.getValue());
        });

        shareButton.addEventListener('click', function() {
            config.onShareSource(editor.getValue());
            isEditing = false;
        });

        updateEditor();
        updatePreview();

        return {
            updateEditor: updateEditor,
            updatePreview: updatePreview,
            setEditing: setEditing
        };
    }

    // Initialization ----------------------------------------------------------

    function setDisplay(id, value) { document.getElementById(id).style.display = value; }
    function hideLoadingMessage() { setDisplay('loadingMessage', 'none'); }
    function showError() {
        hideLoadingMessage();
        setDisplay('errorMessage', 'block');
    }
    function showContent() {
        hideLoadingMessage();
        setDisplay('content', 'block');
    }

    function start() {

        var joinRequest = getJoinRequestFromHash(),
            chat, editor;

        if (!joinRequest) {
            showError();
            return;
        }

        var socket = io.connect('http://' + host + ':' + port + '/');

        socket.on('connect', function() {
            socket.emit('join', joinRequest);
        });

        socket.on('hello', function(data) {

            showContent();

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
                },

                onStartEditing: function() {
                    socket.emit('startediting');
                }
            });

        });

        socket.on('updatesource', function(source) {
            editor.updateEditor(source);
            editor.setEditing(false);
        });

        socket.on('startediting', function() {
            console.log('startediting');
            editor.setEditing(true);
        });
    }

    window.onload = start;

})(window);
