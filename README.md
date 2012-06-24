# InterviewBox

A simple application for interviewing web developers online.

Implemented using [OpenTok API](http://www.tokbox.com/opentok/api),
[Node.js](http://nodejs.org/), [Sockets.io](http://socket.io/),
[CodeMirror](http://codemirror.net/)
and [Twitter Bootstrap](http://twitter.github.com/bootstrap/).

## The Idea

Imagine a technical interview.
You sit in a room, talk and occasionally write some code on paper.
But sometimes it is hard or impossible to gather all the participants in one 
place and 'paper coding' sucks for most of the people either.

When you are interviewing web developers the solution can be fairly simple.
Lets just move the interview into our 'natural environment' into the browser.
Modern web provides everything that we need for that.
Thanks [TokBox](http://www.tokbox.com/) now we can have video chat on any web page.
Coding and sharing code is not a big deal either.
As a nice bonus you can execute the code so there is no need any more
to turn your brain into an interpreter.

So meet InterviewBox - a simple application for interviewing web developers online.

## How To Use

The UI is minimalistic by design.
It means that you get only what you need for the interview nothing more.

To start send links to all participants in the following format:

    http://interviewbox.on.your.site.com/#interview1/participant1
    http://interviewbox.on.your.site.com/#interview1/participant2
    ...

And for another interview:

    http://interviewbox.on.your.site.com/#interview2/participant3
    http://interviewbox.on.your.site.com/#interview2/participant4
    ...
    
You don't need to do anything to create `interview1` and `interview2`
and register participants, it happens automatically.

When you enter the interview, video chat will start in a couple of seconds.

When you are done, just close brower's tab to leave the interview.

Enjoy.

## Troubleshooting

To provide video chat Adobe Flash Player is used.
If you see "Connecting to video chat..." message instead of video for more than one minute
check here http://get.adobe.com/flashplayer/
if you have Flash Player (ver. 10.0 or later) installed.

## Notes

http://www.tokbox.com/opentok/api/documentation/gettingstarted -
need to be updated - `TB.initPublisher()` takes element's id as the second parameter
but not as the fist one as mentioned.

See [log.md](https://github.com/yushchenko/interviewbox/blob/master/docs/log.md)
tracking..
