'use strict';

const ProductPrice = require('../models/ProductPrice');
const ResponseGenerator = require('../utils/response-generator');
const authorizer = require('../utils/authorizer');
const DBConnector = require('../utils/db-connector');
const jwt = require('jsonwebtoken');

const addPricePermission = ['store'];

module.exports.addPrice = async function (event, context) {
    try {
        await DBConnector.connectToDatabase();
        const decodedUser = await jwt.verify(event.headers.authorizationToken, process.env.JWT_SECRET);
        const hasPermission = authorizer.checkIfIncludes(decodedUser, addPricePermission);
        if(!hasPermission) {
            return ResponseGenerator.getResponseWithMessage(400, "Access Denied");
        }
        const requestBody = JSON.parse(event.body);
        const productPrice = new ProductPrice(requestBody);
        const queryObj = {
            storeId: productPrice.storeId,
            proId: productPrice.proId
        }
        const dbProductPrice = await ProductPrice.findOne(queryObj);
        if(!dbProductPrice) {
            await ProductPrice.create(productPrice);
            return ResponseGenerator.getResponseWithMessage(200, "Added to Database");
        }
        await dbProductPrice.addPricing(productPrice);
        await ProductPrice.create(dbProductPrice);
        return ResponseGenerator.getResponseWithMessage(200, "Added to Database");
    } catch (err) {
        console.error(err);
        return ResponseGenerator.getResponseWithMessage(500, err.message);
    }
}
