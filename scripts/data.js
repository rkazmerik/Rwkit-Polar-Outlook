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
    
    deleteEntitiesByPoll: function(entityType, entityInfo, callback) {
        var batch = new azure.TableBatch();
        
        var query = new azure.TableQuery()
            .where("PartitionKey eq ?", entityType)
            .and("entityId eq ?", entityInfo.pollId)
            
        tableService.queryEntities(tableId, query, null, function (error, result, response) {
            for (var i=0; i<result.entries.length; i++) {
                batch.deleteEntity(result.entries[i], {echoContent:true});
            }
            if(batch.operations.length > 0){
                tableService.executeBatch(tableId, batch, function (error, result, response) {
                    if (!error) {
                        callback(response);
                    } if (error) {
                        onError(error, callback);
                    }
                });
            } else {
                callback();
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
    
    createPoll : function(pollInfo, callback) {    
        
        var entity = {
            PartitionKey: entGen.String("Poll"),
            RowKey: entGen.String(uuid.v1()),
            title: entGen.String(pollInfo.title),
            dateCreated: entGen.DateTime(new Date(Date.now()))
        };
    
        tableService.insertEntity(tableId, entity, function (error, result, response) {
            if (!error) {
                result["RowKey"] = entity.RowKey._;
                callback(result);
            } if (error) {
                onError(error, callback);
            }
        });
    },
    
    editPoll : function(pollInfo, callback) {         
        
        var entity = {
            PartitionKey: entGen.String("Poll"),
            RowKey: entGen.String(pollInfo.pollId),
            title: entGen.String(pollInfo.title)
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
    createQuestion : function(questionInfo, callback) {    
        
        var questionId = uuid.v4();
        var entity = {
            PartitionKey: entGen.String("Question"),
            RowKey: entGen.String(questionId),
            entityId: entGen.String(questionInfo.pollId),
            question: entGen.String(questionInfo.question)
        };
        
        tableService.insertEntity(tableId, entity, function (error, result, response) {
            if (!error) {
                result["RowKey"] = entity.RowKey._;
                callback(result);
            } if (error) {
                onError(error, callback);
            }
        });     
    },
    
    editQuestion : function(questionInfo, callback) {         
        
        var entity = {
            PartitionKey: entGen.String("Question"),
            RowKey: entGen.String(questionInfo.questionId),
            question: entGen.String(questionInfo.question)
        };
    
        tableService.mergeEntity(tableId, entity, function (error, result, response) {
            if (!error) {
                result["RowKey"] = entity.RowKey._;
                callback(result);
            } if (error) {
                onError(error, callback);
            }
        });
    },
    
    //ANSWER FUNCTIONS
    createAnswers : function(answerInfo, callback) {    
        var batch = new azure.TableBatch();
            
            for(i=0; i < answerInfo.answers.length; i++){
                var answerId = uuid.v4();

                var entity = {
                    PartitionKey: entGen.String("Answer"),
                    RowKey: entGen.String(answerId),
                    entityId: entGen.String(answerInfo.pollId),
                    questionId: entGen.String(answerInfo.questionId),
                    answer: entGen.String(answerInfo.answers[i]),
                    color: entGen.String(answerInfo.colors[i]),
                    tally: entGen.Int32(0),
                    order: entGen.Int32(i)
                }
                batch.insertEntity(entity, {echoContent:true});
            }
            
        if(batch.operations.length > 0) {   
             
            tableService.executeBatch(tableId, batch, function (error, result, response) {
                if (!error) {
                    callback(response);
                } if (error) {
                    onError(error, callback);
                }
            });
        } else {
            callback();
        }
    },
    
    updateTally : function(answerInfo, callback) {
        
        if(answerInfo.tally != -1){
            answerInfo.tally++;
        }
        
        var entity = {
            PartitionKey: entGen.String("Answer"),
            RowKey: entGen.String(answerInfo.answerId),
            tally: entGen.String(answerInfo.tally || 0)
        };
    
        tableService.mergeEntity(tableId, entity, function (error, result, response) {
            if (!error) {
                callback(response);
            } if (error) {
                onError(error, callback);
            }
        }); 
    },
    
    //RESPONSE FUNCTIONS
    createResponses : function(responseInfo, callback) {
        var batch = new azure.TableBatch();
           
        for(var i=0; i<responseInfo.answer.length; i++) {
            var responseId = uuid.v4();
            var entity = {
                PartitionKey: entGen.String("Response"),
                RowKey: entGen.String(responseId),
                entityId: entGen.String(responseInfo.pollId),
                questionId: entGen.String(responseInfo.questionId),
                response: entGen.String(responseInfo.answer),
                user: entGen.String(responseInfo.user || "admin"),
                dateCreated: entGen.DateTime(new Date(Date.now()))
            };
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
    },
};

//PRIVATE FUNCTIONS
function onError(error, callback){
    var err = ("Something went wrong: " + error)
    console.log(err);
    callback(err);
}