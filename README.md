#RwkitPolar Outlook Add-in

##Entity Types
- Poll
- Question
- Answer
- Response

##Routes
/polls
/polls/view/:pollId
/polls/create
/polls/edit/:pollId
/polls/delete/:pollId
/polls/insert/:pollId
/polls/chart/:chartId

##Todos
- Replace D3 with highcharts
- Clean up data layer

##Bugs
- Need word breaking on donut legend
- Using back button allows multiple responses
- Keep answers in same order as entered in view
- Multiple submits makes the form go nuts
- Getting 'batch to large error' on poll reset
    - Batches must be 100 entities max!

##Backburner
- setup dev and prd slots on webapp