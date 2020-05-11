'use strict';

const ResponseGenerator = require('../utils/response-generator');
const jwt = require('jsonwebtoken');
const DBConnector = require('../utils/db-connector');
const authorizer = require('../utils/authorizer');
const Category = require('../models/Category');

const getCategoriesPermission = ['admin', 'store', 'customer'];
const getSubCategoriesPermission = ['admin', 'store', 'customer'];
const addCategoriesPermission = ['admin'];

module.exports.getCategories = async function (event, context) {
    try {
        const connect = DBConnector.connectToDatabase();
        const projectionObj = {
            category: true,
            catImageUri: true
        }
        await connect;
        const categories = await Category.find({}, projectionObj);
        return ResponseGenerator.getResponseWithObject(200, categories);
    } catch (err) {
        console.error(err);
        return ResponseGenerator.getResponseWithMessage(500, err.message);
    }
}

module.exports.getSubCategories = async function(event, context) {
    try {
        const connect = DBConnector.connectToDatabase();
        const queryObj = {};
        const queryStringParameters = event.queryStringParameters;
        if(queryStringParameters) {
            if(queryStringParameters.category)
                queryObj['category'] = queryStringParameters.category;
        }
        await connect;
        const categories = await Category.find(queryObj);
        return ResponseGenerator.getResponseWithObject(200, categories);
    } catch (err) {
        console.error(err);
        return ResponseGenerator.getResponseWithMessage(500, err.message);
    }
}

module.exports.checkCatAndSub = async function (category, subCategory) {
    const connect = DBConnector.connectToDatabase();
    const queryObj = {
        category: category,
        subCat: {
            $all: [
                {
                    subCategory: subCategory
                }
            ]
        }
    };
    await connect;
    const catDocument = await Category.findOne(queryObj);
    return catDocument !== null;
}