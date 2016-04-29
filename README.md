#RwkitPolar Outlook Add-in

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
- createQuestions
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


##Todos

##Bugs
- Using back button allows multiple responses
- Keep answers in same order as entered in view
- Getting 'batch to large error' on poll reset
    - Batches must be 100 entities max!

##Backburner
- setup dev and prd slots on webapp