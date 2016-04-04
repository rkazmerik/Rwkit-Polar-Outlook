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
- Remove hardcode from chart ajax post
- Add back button to chart preview

##Bugs
- Need word breaking on donut legend
- Using back button allows multiple responses
- Can't delete poll with no responses (crashes)
- Can't answer poll with no radio selection (crashes)

##Backburner
- setup dev and prd slots on webapp



            {{#if preview}}
                    
            {{/if}}