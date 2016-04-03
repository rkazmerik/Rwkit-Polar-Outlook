
var azure = require('azure-storage');
var uuid = require('uuid');
var tableService = azure.createTableService(
  "rwkit", "KMExfls8zGUpuW/gy/OlEt4N7FOy7nLBvyg6ZrwFYGkCkjOU9JDk0eIqZ3tYjeg2CuNV2YAuYO5dQG6Fq3qjwg=="
  );

var tableId = 'rwkit';
var entGen = azure.TableUtilities.entityGenerator;
        
module.exports = {

    //PUBLIC FUNCTIONS
    getAnswers: function(callback) {
        var query = new azure.TableQuery()
            .where("PartitionKey eq ?", "Answer")
    
        tableService.queryEntities(tableId, query, null, function (error, result, response) {
            if (!error) {
                callback(response);
            } if (error) {
                onError(error, callback);
            }
        });
    },
    
    getAnswerById: function(answerId, callback) {
        var query = new azure.TableQuery()
            .where("PartitionKey eq ?", "Answer")
            .and("RowKey eq ?", answerId)
        
        tableService.queryEntities(tableId, query, null, function (error, result, response) {
            if (!error) {
                callback(response);
            } if (error) {
                onError(error, callback);
            }
        });
    },
    
    getAnswersByEntity: function(entityId, callback) {
        var query = new azure.TableQuery()
            .where("PartitionKey eq ?", "Answer")
            .and("entityId eq ?", entityId)
            
        tableService.queryEntities(tableId, query, null, function (error, result, response) {
            if (!error) {
                callback(response);
            } if (error) {
                onError(error, callback);
            }
        });
    },
    
    createAnswer : function(entityId, questionId, answerInfo, callback) {    
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
    
    editAnswers : function(answerInfo, callback) {         
        var batch = new azure.TableBatch();
        var noAnswers = answerInfo.answers.length;
            
            for(i=0; i<noAnswers; i++){
                var entity = {
                    PartitionKey: entGen.String("Answer"),
                    RowKey: entGen.String(answerInfo.answerId[i]),
                    answer: entGen.String(answerInfo.answers[i]),
                    color: entGen.String(answerInfo.colors[i])
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
    
    updateTally : function(responseObj, operator, callback) {
        module.exports.getAnswerById(responseObj.answerId, function (resp) {
             
            var newTally = resp.body.value[0].tally;
            if(operator == "add")
                newTally++;
            if(operator == "sub")
                newTally--;
            
            var entity = {
                PartitionKey: entGen.String("Answer"),
                RowKey: entGen.String(responseObj.answerId),
                tally: entGen.Int32(newTally)
            };
    
            tableService.mergeEntity(tableId, entity, function (error, result, response) {
                if (!error) {
                    callback(response);
                } if (error) {
                    onError(error, callback);
                }
            });
            
        });
    },
    
    deleteAnswer : function(answerId, callback){    
        var answer = {
            PartitionKey: entGen.String("Answer"),
            RowKey: entGen.String(answerId)
        };
        
        tableService.deleteEntity(tableId, answer, function(error, response){
            if(!error){
                callback(response);
            } if (error) {
                onError(error, callback);
            }
        });
    },
    
    deleteAnswersByEntity : function(entityId, callback){
        var batch = new azure.TableBatch();
        
        module.exports.getAnswersByEntity(entityId, function(resp){
            var noResponses = resp.body.value.length;
            if(noResponses > 0) {
                for(i=0; i<noResponses; i++){
                    var entity = {
                        PartitionKey: entGen.String("Answer"),
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