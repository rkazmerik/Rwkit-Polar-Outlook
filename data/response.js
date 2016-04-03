
var azure = require('azure-storage');
var uuid = require('uuid');
var tableService = azure.createTableService(
  "rwkit", "KMExfls8zGUpuW/gy/OlEt4N7FOy7nLBvyg6ZrwFYGkCkjOU9JDk0eIqZ3tYjeg2CuNV2YAuYO5dQG6Fq3qjwg=="
  );

var tableId = 'rwkit';
var entGen = azure.TableUtilities.entityGenerator;
        
module.exports = {

    //PUBLIC FUNCTIONS
    getResponses: function(callback) {
        var query = new azure.TableQuery()
            .where("PartitionKey eq ?", "Response")
    
        tableService.queryEntities(tableId, query, null, function (error, result, response) {
            if (!error) {
                callback(response);
            } if (error) {
                onError(error, callback);
            }
        });
    },
    
    getResponsesByEntity : function(entityId, callback){
        var query = new azure.TableQuery()
            .where('PartitionKey eq ? ', 'Response')
            .and('entityId eq ? ', entityId);
    
        tableService.queryEntities(tableId, query, null, function (error, result, response) {
            if (!error) {
                callback(response);
            } if (error) {
                onError(error, callback);
            }
        });
    },
    
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
           
        for(var i=0; i<responseInfo.responses.length; i++) {
            var responseId = uuid.v4();
            var response = {
                PartitionKey: entGen.String("Response"),
                RowKey: entGen.String(responseId),
                entityId: entGen.String(entityId),
                questionId: entGen.String(responseInfo.questionId[i]),
                response: entGen.String(responseInfo.responses[i]),
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
    
    deleteResponse : function(responseId, callback){
        var entity = {
            PartitionKey: entGen.String("Response"),
            RowKey: entGen.String(responseId)
        };    
        
        tableService.deleteEntity(tableId, entity, function(error, result, response) {
            if(!error){
                callback(response);
            } if (error) {
                onError(error, callback);
            }
        });
    },
    
    deleteResponsesByEntity : function(entityId, callback){
        var batch = new azure.TableBatch();
        
        module.exports.getResponsesByEntity(entityId, function(resp){
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