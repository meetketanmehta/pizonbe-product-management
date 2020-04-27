'use strict';

const mongoose = require('mongoose');
const ResponseGenerator = require('../utils/response-generator');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');
const Validator = require('../utils/authorizer');
const DBConnector = require('../utils/db-connector');

const url =  process.env.DB_URI + "/" + process.env.DB_NAME;

const getNearbyProductsPermission = ['customer'];
const getBrandsPermission = ['customer', 'store', 'admin'];

module.exports.getBrands = async function (event, context) {
    try {
        const connect = DBConnector.connectToDatabase();
        const decodedUser = await jwt.verify(event.headers.authorizationToken, process.env.JWT_SECRET);
        const hasPermission = Validator.checkIfIncludes(decodedUser, getBrandsPermission);
        if(!hasPermission) {
            return ResponseGenerator.getResponseWithMessage(403, "Access Denied");
        }
        let queryObj = {};
        const queryStringParameters = event.queryStringParameters;
        if(queryStringParameters) {
            if(queryStringParameters.category)
                queryObj['category'] = queryStringParameters.category;
            if(queryStringParameters.subCategory)
                queryObj['subCategory'] = queryStringParameters.subCategory;
        }
        const projectionObj = {
            _id: false,
            brand: true
        };
        await connect;
        const products = await Product.find(queryObj, projectionObj);
        if(!products)
            return ResponseGenerator.getResponseWithObject(404, []);
        const brands = products.map(product => product.brand);
        const brandsFiltered = Array.from(new Set(brands));
        return ResponseGenerator.getResponseWithObject(200, brandsFiltered);
    } catch (err) {
        console.error(err);
        return ResponseGenerator.getResponseWithMessage(500, err.message);
    }
}

module.exports.addProduct = async function (event, context) {
    try {
        await mongoose.connect(url);
        console.log("Connected to DB");
        const decodedUser = await jwt.verify(event.headers.authorizationToken, process.env.JWT_SECRET);
        if(!(decodedUser.userType === 'admin' || decodedUser.userType === 'store'))
            return ResponseGenerator.getResponseWithMessage(400, "Access Denied");
        const requestBody = JSON.parse(event.body);
        const product = new Product(requestBody);
        await product.addApproval(decodedUser);
        const catPresent = await product.matchCatAndSub();
        if(!catPresent)
            return ResponseGenerator.getResponseWithMessage(400, "Category/SubCategory not present");
        product.save();
        return ResponseGenerator.getResponseWithMessage(200, "Product added to Database");
    } catch (err) {
        console.error(err);
        return ResponseGenerator.getResponseWithMessage(400, err.message);
    }
}

module.exports.approveProduct = async function (event, context) {
    try {
        const decodedUser = await jwt.verify(event.headers.authorizationToken, process.env.JWT_SECRET);
        if(decodedUser.userType !== 'admin')
            return ResponseGenerator.getResponseWithMessage(400, "Access Denied");
        await mongoose.connect(url);
        const requestBody = JSON.parse(event.body);
        const product = await Product.findOne({_id: requestBody._id});
        await product.updateProduct(requestBody);
        await product.addApproval(decodedUser);
        await product.save();
        return ResponseGenerator.getResponseWithMessage(200, "Product Approved");
    } catch (err) {
        console.error(err);
        return ResponseGenerator.getResponseWithMessage(400, err.message);
    }
}

module.exports.getProducts = async function (event, context) {
    try {
        const decodedUser = await jwt.verify(event.headers.authorizationToken, process.env.JWT_SECRET);
        await mongoose.connect(url);
        var queryObj = {
            "approval.status": "Approved"
        };
        if(event.pathParameters) {
            if(event.pathParameters.category)
                queryObj["category"] = decodeURI(event.pathParameters.category);
            if(event.pathParameters.subCategory)
                queryObj["subCategory"] = decodeURI(event.pathParameters.subCategory);
        }
        var products = await Product.find(queryObj);
        return ResponseGenerator.getResponseWithObject(200, products);
    } catch (err) {
        console.error(err);
        return ResponseGenerator.getResponseWithMessage(400, err.message);
    }
}

module.exports.getUnApprovedProducts = async function (event, context) {
    try {
        const decodedUser = await jwt.verify(event.headers.authorizationToken, process.env.JWT_SECRET);
        const hasRights = Validator.checkIfIncludes(decodedUser, ['admin']);
        if(!hasRights) {
            return ResponseGenerator.getUnauthorizedResponse();
        }
        await mongoose.connect(url);
        const queryObj = {
            "approval.status": "Not Approved"
        }
        if(event.pathParameters) {
            if(event.pathParameters.category)
                queryObj["category"] = decodeURI(event.pathParameters.category);
            if(event.pathParameters.subCategory)
                queryObj["subCategory"] = decodeURI(event.pathParameters.subCategory);
        }
        var products = await Product.find(queryObj);
        return ResponseGenerator.getResponseWithObject(200, products);
    } catch (err) {
        console.error(err);
        return ResponseGenerator.getResponseWithMessage(400, err.message);
    }
}

// module.exports.getNearbyProducts = async function (event, context) {
//     try {
//         await DBConnector.connectToDatabase();
//         const decodedUser = await jwt.verify(event.headers.authorizationToken, process.env.JWT_SECRET);
//         const hasPermission = Validator.checkIfIncludes(decodedUser, getNearbyProductsPermission);
//         if(!hasPermission){
//             return ResponseGenerator.getResponseWithMessage(400, "Access Denied");
//         }
//         const requestBody = JSON.parse(event.body);
//
//     } catch(err) {
//         console.error(err);
//         return ResponseGenerator.getResponseWithMessage(500, err.message);
//     }
// }