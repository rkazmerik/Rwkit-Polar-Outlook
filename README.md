#Rwkit Polar Outlook Add-in

##Entity Types
- Poll
- Question
- Answer
- Response

##Data
- getPoll
- getEntitiesByPoll
- createPoll
- editPoll
- createAnswers
- editAnswers
- createQuestion
- editQuestions
- getResponsesByUser
- createResponses
- deleteResponses

##Routes
/create
/create (post)
/view
/view/:pollId
/view/:pollId (post)
/edit/:pollId
/edit/:pollId (post)
/reset/:pollId
/donut/:chartId

##Views
- layout/master
- helper/preview
- create
- donut
- edit
- redirect
- view

##Todos
- Normalize javascript

##Bugs
- Need to prevent multiple responses from non-preview user
- Keep answers in same order as entered in view
- Getting 'batch to large error' on poll reset
    - Batches must be 100 entities max!
