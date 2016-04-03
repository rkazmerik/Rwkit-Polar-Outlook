
var azure = require('azure-storage');
var uuid = require('uuid');
var tableService = azure.createTableService(
  "rwkit", "KMExfls8zGUpuW/gy/OlEt4N7FOy7nLBvyg6ZrwFYGkCkjOU9JDk0eIqZ3tYjeg2CuNV2YAuYO5dQG6Fq3qjwg=="
  );

var tableId = 'rwkit';
var entGen = azure.TableUtilities.entityGenerator;
        
module.exports = {

    //PUBLIC FUNCTIONS
    getTable: function(callback) {
        var query = new azure.TableQuery()
            .select("*");
    
        tableService.queryEntities(tableId, query, null, function (error, result, response) {
            if (!error) {
                callback(response);
            } if (error) {
                onError(error, callback);
            }
        });
    },
    
    createTable: function(callback) {
        tableService.createTableIfNotExists(tableId, function(error, result, response){
            if(!error){
                console.log("Table created");
                callback(response);
            } if (error) {
                onError(error, callback);
            }
        });
    },
    
    deleteTable: function(callback) {
        tableService.deleteTable(tableId, function(error, response){
            if(!error){
                console.log("Table deleted");
                callback(response);
            } if(error) {
                onError(error, callback);
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