const MongoClient = require('mongodb').MongoClient;
const responseGenerator = require('../utils/response-generator');

const uri = process.env.DB_URI;

const mongoClient = new MongoClient(uri);

module.exports.addCategory = function (event, context, callback) {
    context.callbackWaitsForEmptyEventLoop = false;
    const requestBody = JSON.parse(event.body);
    const category = requestBody.category;
    mongoClient.connect(function (err) {
        if(err){
            console.error(err.message);
            const response = responseGenerator.getResponseWithMessage(500, "Unable to connect to database");
            return callback(null, response);
        }
        console.log("Connected to database");
        const dbObject = mongoClient.db("product-management");
        const collection = dbObject.collection("categories");
        const queryObject = {
            "name": category
        };
        const projectionObject = {
            "name" : 1
        };
        collection.find(queryObject, projectionObject).toArray(function (err, res) {
            if(err){
                console.error(err.message);
                const response = responseGenerator.getResponseWithMessage(500, "Internal Server Error");
                return callback(null, response);
            }
            if(res.length !== 0){
                const response = responseGenerator.getResponseWithMessage(400, "Category already exists");
                return callback(null, response);
            }
            collection.insertOne(queryObject, function (err, res) {
                if(err){
                    console.error(err.message);
                    const response = responseGenerator.getResponseWithMessage(400, "Category not added, " +
                        "Please try again later");
                    return callback(null, response);
                }
                const response = responseGenerator.getResponseWithMessage(200, category + " was " +
                    "successfully added to database");
                return callback(null, response);
            });
        });
    });
}