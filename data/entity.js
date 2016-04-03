
var azure = require('azure-storage');
var uuid = require('uuid');
var tableService = azure.createTableService(
  "rwkit", "KMExfls8zGUpuW/gy/OlEt4N7FOy7nLBvyg6ZrwFYGkCkjOU9JDk0eIqZ3tYjeg2CuNV2YAuYO5dQG6Fq3qjwg=="
  );

var tableId = 'rwkit';
var entGen = azure.TableUtilities.entityGenerator;
        
module.exports = {

    //PUBLIC FUNCTIONS
    getEntity: function(entityId, callback) {
        var query = new azure.TableQuery()
            .where('RowKey eq ? ', entityId);
    
        tableService.queryEntities(tableId, query, null, function (error, result, response) {
            if (!error) {        
                callback(response);
            } if (error) {
                onError(error, callback);
            }
        });
    },
    
     getEntities: function(entityType, callback) {
        var query = new azure.TableQuery()
            .where("PartitionKey eq ?", entityType);
    
        tableService.queryEntities(tableId, query, null, function (error, result, response) {
            if (!error) {
                callback(response);
            } if (error) {
                onError(error, callback);
            }
        });
    },
    
    createEntity : function(entityInfo, entityType, callback) {    
        
        var entity = {
            PartitionKey: entGen.String(entityType),
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
    
    editEntity : function(entityInfo, entityType, callback) {         
        
        var entity = {
            PartitionKey: entGen.String(entityType),
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
};

//PRIVATE FUNCTIONS
function onError(error, callback){
    var err = ("Something went wrong: " + error)
    console.log(err);
    callback(err);
}