'use strict';

const mongoose = require('mongoose');
const ResponseGenerator = require('../utils/response-generator');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');

const url =  process.env.DB_URI + "/" + process.env.DB_NAME;

module.exports.addProduct = async function (event, context) {
    try {
        await mongoose.connect(url);
        console.log("Connected to DB");
        const decodedUser = await jwt.verify(event.headers.authorizationToken, process.env.JWT_SECRET);
        if(!(decodedUser.userType === 'admin' || decodedUser.userType === 'store'))
            return ResponseGenerator.getResponseWithMessage(400, "Access Denied");
        const requestBody = JSON.parse(event.body);
        const product = new Product(requestBody);
        await product.addAttributes(decodedUser);
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