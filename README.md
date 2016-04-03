#RwkitPolar

##Entity Types
- Poll
- Survey
- Question
- Answer
- Response

##Routes
###Admin
/admin/table
/admin/create/table
/admin/delete/table

###Polls
/polls
/polls/view/:pollId
/polls/create
/polls/edit/:pollId
/polls/delete/:pollId
/polls/:pollId/responses
/polls/:pollId/chart

###Surveys
/surveys
/surveys/view/:surveyId
/surveys/create
/surveys/edit/:surveyId
/surveys/delete/:surveyId
/surveys/:surveyId/responses
/surveys/:surveyId/chart (TODO)

/questions
/answers
/responses

##Todos
- Add begin and end date to poll + survey
- Get Office init working with jQuery (look at Napa example)
- 

##Bugs
- Need word breaking on donut legend
- Delete dialog box doesn't show in Outlook add-in
- Using back button allows multiple responses
- Can't delete poll with no responses (crashes)

##Backburner
- setup dev and prd slots on webapp
- rename this project 'rwkit'
- write visualization for survey
