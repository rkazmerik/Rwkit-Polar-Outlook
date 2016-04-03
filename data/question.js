
var azure = require('azure-storage');
var uuid = require('uuid');
var tableService = azure.createTableService(
  "rwkit", "KMExfls8zGUpuW/gy/OlEt4N7FOy7nLBvyg6ZrwFYGkCkjOU9JDk0eIqZ3tYjeg2CuNV2YAuYO5dQG6Fq3qjwg=="
  );

var tableId = 'rwkit';
var entGen = azure.TableUtilities.entityGenerator;
        
module.exports = {

    //PUBLIC FUNCTIONS
    getQuestions: function(callback) {
        var query = new azure.TableQuery()
            .where("PartitionKey eq ?", "Question");
    
        tableService.queryEntities(tableId, query, null, function (error, result, response) {
            if (!error) {
                callback(response);
            } if (error) {
                onError(error, callback);
            }
        });
    },
    
    getQuestionsByEntity: function(entityId, callback) {
        var query = new azure.TableQuery()
            .where("PartitionKey eq ?", "Question")
            .and("entityId eq ?", entityId)
            
        tableService.queryEntities(tableId, query, null, function (error, result, response) {
            if (!error) {
                callback(response);
            } if (error) {
                onError(error, callback);
            }
        });
    },
    
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
    
    deleteQuestion : function(questionId, callback){    
        var question = {
            PartitionKey: entGen.String("Question"),
            RowKey: entGen.String(questionId)
        };
        
        tableService.deleteEntity(tableId, question, function(error, response){
            if(!error){
                callback(response);
            } if (error) {
                onError(error, callback);
            }
        });
    },

    deleteQuestionsByEntity : function(entityId, callback){
        var batch = new azure.TableBatch();
        
        module.exports.getQuestionsByEntity(entityId, function(resp){
            var noResponses = resp.body.value.length;
            if(noResponses > 0) {
                for(i=0; i<noResponses; i++){
                    var entity = {
                        PartitionKey: entGen.String("Question"),
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