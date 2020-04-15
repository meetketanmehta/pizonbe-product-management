'use strict';

const MongoClient = require('mongodb').MongoClient;
const responseGenerator = require('../utils/response-generator');

const uri = process.env.DB_URI;

const mongoClient = new MongoClient(uri);

module.exports.getAllCategories = async (event, context) => {
    try {
        await mongoClient.connect();
        const collection = await mongoClient.db(process.env.DB_NAME).collection(process.env.DB_COLL_CATEGORY);
        const projectionObject = {"category": 1, _id:0};
        const values = await collection.find({}).project(projectionObject).toArray();
        return responseGenerator.getResponseWithArray(200, values);
    } catch (err) {
        console.log(err.message);
        return responseGenerator.getResponseWithMessage(500, "Internal Server Error");
    }
};

module.exports.getAllDB = async (event, context) => {
    try{
        await mongoClient.connect();
        console.log("Connected to DB");
        const collection = await mongoClient.db(process.env.DB_NAME).collection(process.env.DB_COLL_CATEGORY);
        console.log("Got collection " + process.env.DB_COLL_CATEGORY);
        const projectionObject = {_id:0};
        const values = await collection.find({}).project(projectionObject).toArray();
        return responseGenerator.getResponseWithArray(200, values);
    } catch (err) {
        console.error(err.message);
        return responseGenerator.getResponseWithMessage(500, "Internal Server Error");
    }
}

module.exports.getSubCategory = async (event, context) => {
    try{
        await mongoClient.connect();
        console.log("Connected to DB");
        const collection = await mongoClient.db(process.env.DB_NAME).collection(process.env.DB_COLL_CATEGORY);
        console.log("Got collection " + process.env.DB_COLL_CATEGORY);
        const category = event.pathParameters.category;
        const queryObject = {
            category: category
        };
        const projectionObject = {
            _id:0,
        };
        const values = await collection.find(queryObject).project(projectionObject).toArray();
        return responseGenerator.getResponseWithArray(200, values);
    } catch (err) {
        console.error(err.message);
        return responseGenerator.getResponseWithMessage(500, "Internal Server Error");
    }
}

module.exports.addSubCategory = async (event, context) => {
    try{
        const requestBody = JSON.parse(event.body);
        await mongoClient.connect();
        console.log("Connected to DB");
        const collection = await mongoClient.db(process.env.DB_NAME).collection(process.env.DB_COLL_CATEGORY);
        console.log("Get collection" + process.env.DB_COLL_CATEGORY);
        const category = requestBody.category;
        const subCategories = requestBody.subCat;
        const queryObject = {
            category: category
        };
        const values = await collection.find(queryObject).toArray();
        if(values.length === 0)
            return responseGenerator.getResponseWithMessage(400, "Category not found in dB");
        const newValueObject = {
            $addToSet: {
                subCat: {
                    $each: subCategories
                }
            }
        }
        const res = await collection.update(queryObject, newValueObject);
        return responseGenerator.getResponseWithMessage(200, "SubCategories added Successfully");
    } catch (err) {
        console.error(err.message);
        return responseGenerator.getResponseWithMessage(500, "Internal Server Error");
    }
}

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
        const dbObject = mongoClient.db(process.env.DB_NAME);
        const collection = dbObject.collection(process.env.DB_COLL_CATEGORY);
        const queryObject = {
            "category": category
        };
        const projectionObject = {
            _id: 0,
            "category" : 1
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