var azure = require('azure-storage');
var uuid = require('uuid');
var tableService = azure.createTableService(
  "rwkit", "KMExfls8zGUpuW/gy/OlEt4N7FOy7nLBvyg6ZrwFYGkCkjOU9JDk0eIqZ3tYjeg2CuNV2YAuYO5dQG6Fq3qjwg=="
  );

var tableId = 'rwkit';
var entGen = azure.TableUtilities.entityGenerator;
        
module.exports = {
    
    //SHARED FUNCTIONS
    getEntitiesByPoll: function(entityType, entityId, callback) {
        var query = new azure.TableQuery()
            .where("PartitionKey eq ?", entityType)
            .and("entityId eq ?", entityId)
            
        tableService.queryEntities(tableId, query, null, function (error, result, response) {
            if (!error) {
                callback(response);
            } if (error) {
                onError(error, callback);
            }
        });
    },
    
    //POLL FUNCTIONS
    getPoll: function(entityType, entityId, callback) {
        var query = new azure.TableQuery()
            .where("PartitionKey eq ?", entityType)
            .and("RowKey eq ?", entityId)
            
        tableService.queryEntities(tableId, query, null, function (error, result, response) {
            if (!error) {
                callback(response);
            } if (error) {
                onError(error, callback);
            }
        });
    },
    
    createPoll : function(entityInfo, callback) {    
        
        var entity = {
            PartitionKey: entGen.String("Poll"),
            RowKey: entGen.String(uuid.v1()),
            title: entGen.String(entityInfo.title),
            dateCreated: entGen.DateTime(new Date(Date.now()))
        };
    
        tableService.insertEntity(tableId, entity, function (error, result, response) {
            if (!error) {
                callback(entity);
            } if (error) {
                onError(error, callback);
            }
        });
    },
    
    editPoll : function(entityInfo, callback) {         
        
        var entity = {
            PartitionKey: entGen.String("Poll"),
            RowKey: entGen.String(entityInfo.entityId),
            title: entGen.String(entityInfo.title)
        };
    
        tableService.mergeEntity(tableId, entity, function (error, result, response) {
            if (!error) {
                callback(response);
            } if (error) {
                onError(error, callback);
            }
        });
    },
    
    //QUESTION FUNCTIONS
    createQuestions : function(entityId, questionInfo, callback) {    
        var batch = new azure.TableBatch();
        
        for(var i=0; i<questionInfo.questions.length; i++) {
            var questionId = uuid.v4();
            var question = {
                PartitionKey: entGen.String("Question"),
                RowKey: entGen.String(questionId),
                entityId: entGen.String(entityId),
                question: entGen.String(questionInfo.questions[i])
            };
            batch.insertEntity(question, {echoContent:true});
        }
        
        tableService.executeBatch(tableId, batch, function (error, result, response) {
            if (!error) {
                callback(question);
            } if (error) {
                onError(error, callback);
            }
        });
       
    },
    
    editQuestions : function(questionInfo, callback) {         
        var batch = new azure.TableBatch();
        
        for(var i=0; i<questionInfo.questions.length; i++) {
            var question = {
                PartitionKey: entGen.String("Question"),
                RowKey: entGen.String(questionInfo.questionId[i]),
                question: entGen.String(questionInfo.questions[i])
            };
            batch.mergeEntity(question, {echoContent:true});
        }
    
        tableService.executeBatch(tableId, batch, function (error, result, response) {
            if (!error) {
                callback(response);
            } if (error) {
                onError(error, callback);
            }
        });
    },
    
    //ANSWER FUNCTIONS
    createAnswers : function(entityId, questionId, answerInfo, callback) {    
        var batch = new azure.TableBatch();
        
            for(i=0; i<answerInfo.answers.length; i++){
                var answerId = uuid.v4();
        
                var entity = {
                    PartitionKey: entGen.String("Answer"),
                    RowKey: entGen.String(answerId),
                    entityId: entGen.String(entityId),
                    questionId: entGen.String(questionId),
                    answer: entGen.String(answerInfo.answers[i]),
                    color: entGen.String(answerInfo.colors[i]),
                    tally: entGen.Int32(0)
                }
                batch.insertEntity(entity, {echoContent:true});
            }
    
        tableService.executeBatch(tableId, batch, function (error, result, response) {
            if (!error) {
                callback(response);
            } if (error) {
                onError(error, callback);
            }
        });
    },
    
    editAnswers : function(answerInfo, operator, callback) {         
        var batch = new azure.TableBatch();
        var noAnswers = answerInfo.answerId.length;
        
        for(i=0; i<noAnswers; i++){
                    
            if(operator == "add")
                answerInfo.tally[i]++;
            if(operator == "sub")
                answerInfo.tally[i]--;
            if(operator == "reset")
                answerInfo.tally[i] = 0;
                
            var entity = {
                PartitionKey: entGen.String("Answer"),
                RowKey: entGen.String(answerInfo.answerId[i]),
                answer: entGen.String(answerInfo.answer[i]),
                color: entGen.String(answerInfo.colors[i]),
                tally: entGen.Int32(parseInt(answerInfo.tally[i]))
            }
                batch.mergeEntity(entity, {echoContent:true});
        }
        
        tableService.executeBatch(tableId, batch, function (error, result, response) {
            if (!error) {
                callback(response);
            } if (error) {
                onError(error, callback);
            }
        });
    },
    
    //RESPONSE FUNCTIONS
    getResponsesByUser : function(entityId, user, callback){
        var query = new azure.TableQuery()
            .where('PartitionKey eq ?', 'Response')
            .and('entityId eq ?', entityId)
            .and('user eq ?', user);
    
        tableService.queryEntities(tableId, query, null, function (error, result, response) {
            if (!error) {
                callback(response);
            } if (error) {
                onError(error, callback);
            }
        });
    },
    
    createResponses : function(entityId, responseInfo, user, callback) {
        var batch = new azure.TableBatch();
           
        for(var i=0; i<responseInfo.answer.length; i++) {
            var responseId = uuid.v4();
            var response = {
                PartitionKey: entGen.String("Response"),
                RowKey: entGen.String(responseId),
                entityId: entGen.String(entityId),
                questionId: entGen.String(responseInfo.questionId[i]),
                response: entGen.String(responseInfo.answer[i]),
                user: entGen.String(user),
                dateCreated: entGen.DateTime(new Date(Date.now()))
            };
            batch.insertEntity(response, {echoContent:true});
        }
       
        tableService.executeBatch(tableId, batch, function (error, result, response) {
            if (!error) {
                callback(response);
            } if (error) {
                onError(error, callback);
            }
        });
    },
    
    deleteResponsesByEntity : function(entityId, callback){
        var batch = new azure.TableBatch();
        
        data.data.getEntitiesByPoll("Response", entityId, function(resp){
            var noResponses = resp.body.value.length;
            if(noResponses > 0) {
                for(i=0; i<noResponses; i++){
                    var entity = {
                        PartitionKey: entGen.String("Response"),
                        RowKey: entGen.String(resp.body.value[i].RowKey)
                    }
                    batch.deleteEntity(entity, {echoContent:true});
                }
            
                tableService.executeBatch(tableId, batch, function(error, result, response) {
                    if(!error){
                        callback(response);
                    } if (error) {
                        onError(error, callback);
                    }
                });
            }
            else{
               callback();
           }
        }); 
    }
};

//PRIVATE FUNCTIONS
function onError(error, callback){
    var err = ("Something went wrong: " + error)
    console.log(err);
    callback(err);
}