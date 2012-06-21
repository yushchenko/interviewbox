# InterviewBox Project Log

## Day 0 - Thu 21 June 2012.

Have got the task in the morning riding the train.
During walkig from Town Hall to Pyrmont decided that I want to build an application 
for interviewing front end developers. 

What do we need for that?

1. Video chat.
2. Text editor which allows to share code between participants
   like sheet of paper on face-to-face interview.
   To simplify things we support only HTML/JavaScript/CSS.
3. Ability to check (execute) the code written in the editor.
   With paper I always feel the lack of this feedback that the browser gives.

Thinking how should it look like during the day in background with coding in Fairfax.
Drawing some mock-ups on paper.
Trying to determine core functionality and cut off all secondary features bearing in mind 
that the users are very technically savvy.

What we have at the end of the day?

1. One page web application. No registration.
   The users can read and understand URLs so no forms required.
   The interviewer types: http://interviewbox/#myInterview/interviewer/Adam
   and the candidate http://interviewbox/#myInterview/candidate/Valery and they can start.
   There can be several interviewers.

2. UI

   * Header: application name
   * VideoChat: ribbon, candidate on one side interviewers on the other
   * CodeEditor
   * Toolbar: Run/Check - or run on change, "Show" and Reset buttons
   * Preview
   * Footer: link to app's GitHub repository

3. Editing Workflow.

   Only one participant can edit code at any given moment.
   The other participants see who is editing.
   The other participants don't see the changes until "Show" buttons is pressed.

4. Data.

   For sake of simplicity using no database.
   The applications state is stored in server memory by interviewID.
   No security at all.
   
   The states updated when:

   * a participant joins/leaves
   * the code is updated

5. Technologies

   * OpenTok API - video chat
   * CodeMirror - code editing
   * Knockout.js - UI
   * Node.js, Sockets.io - service
   * Nginx - web server for static assets

6. Risks

   * Using for the first time OpenTok API, CodeMirror, Knockout.js and Sockets.io
   * Flash on Mac
   * Deployment
   
7. Outcomes

   * Source code in GitHub repository
   * The working application deployed to interviewbox.yushchenko.name

TIME SPENT ~2h
