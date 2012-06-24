(function (window) {

    var HOST = 'interviewbox.yushchenko.name',
        //HOST = 'localhost',
        PORT = '8081',
        DEBUG = true;

    // Chat Module -------------------------------------------------------------
    // provides simple chat using OpenTok API

    function initChat(config) {

        DEBUG && TB.setLogLevel(TB.DEBUG);

        var session = TB.initSession(config.interview.sessionId),
            chatContainer = document.getElementById('chatContainer');

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

                session.subscribe(s, id, { height: 150, width: 200 });
            }
        }

        session.addEventListener('sessionConnected', function (e) {
            
            var element, publisher;

            publisher = TB.initPublisher(config.interview.apiKey, 'publisher',
                { height: 150, width: 200, name: config.name });
            session.publish(publisher);

            subscribeToStreams(e.streams);
        });

        session.addEventListener('streamCreated', function(e) {
            subscribeToStreams(e.streams);
        });

        session.connect(config.interview.apiKey, config.token);
    }

    // Editor Module -----------------------------------------------------------
    // provides code editor, preview and related buttons

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
            iframe.src = 'http://' + HOST + ':' + PORT + '/draft/' +
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

    // Server Module -----------------------------------------------------------
    // provides communication layer with server via Socket.io

    function initServer(config) {

        var socket = io.connect('http://' + HOST + ':' + PORT + '/'),
            isInitialized = false;

        socket.on('connect', function() {

            if (isInitialized) { // preventing double initialization on reconnect
                alert('Server just restarted. Reloading the page...');
                window.location.reload();
                return;
            } 

            socket.emit('join', config.joinRequest);
            isInitialized = true;
        });

        socket.on('hello', function(data) {
            config.onReady(data);
        });

        socket.on('startediting', function() {
            config.onStartEditing();
        });

        socket.on('updatesource', function(source) {
            config.onUpdateSource(source);
        });

        return {

            updateDraft: function(draft, fn) {
                socket.emit('updatedraft', draft, fn);
            },

            updateSource: function(source) {
                socket.emit('updatesource', source);
            },

            startEditing: function() {
                socket.emit('startediting');
            }
        };
    }

    // Utils -------------------------------------------------------

    function getJoinRequestFromHash() {

        var re = /#(\w+)\/(\w+)/,
            result = re.exec(window.location.hash);

        if (!result) return null;

        return {
            interviewId: result[1],
            participantId: result[2]
        };
    }

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

    // Startup -----------------------------------------------------------------
    // entry point - binding all modules and functions together

    window.onload = function start() {

        var joinRequest = getJoinRequestFromHash(),
            server, chat, editor;

        if (!joinRequest) {
            showError();
            return;
        }

        server = initServer({

            joinRequest: joinRequest,

            onReady: function(data) {

                showContent();
    
                chat = initChat({
                    interview: data.interview,
                    token: data.token,
                    name: joinRequest.participantId
                });
    
                editor = initEditor({
                    source: data.interview.source,
                    interviewId: joinRequest.interviewId,
                    participantId: joinRequest.participantId,
    
                    onCheckDraft: function(draft) {
                        server.updateDraft(draft, function() { editor.updatePreview(); });
                    },
    
                    onShareSource: function(source) {
                        server.updateSource(source);
                    },
    
                    onStartEditing: function() {
                        server.startEditing();
                    }
                });
            },

            onStartEditing: function() {
                editor.setEditing(true);
            },

            onUpdateSource: function(source) {
                editor.updateEditor(source);
                editor.setEditing(false);
            }
        });
    };

})(window);
