const ResponseGenerator = require('../utils/response-generator')

module.exports.adminToken = function () {
    return {
        authorizationToken: process.env.ADMIN_ACCESS_TOKEN
    }
}

module.exports.storeToken = function() {
    return {
        authorizationToken: process.env.STORE_ACCESS_TOKEN
    }
}

module.exports.customerToken = function() {
    return{
        authorizationToken: process.env.CUSTOMER_ACCESS_TOKEN
    }
}

module.exports.productPrices  = function (options, prices, stringify) {
    var pricing = [];
    for(const index in options) {
        pricing.push({
            options: options[index],
            price: prices[index]
        });
    }
    const productPrice = {
        storeId: "Test Store Id",
        proId: "Test Product Id",
        pricing: pricing
    };
    if(stringify) {
        return JSON.stringify(productPrice);
    }
    return productPrice;
}

module.exports.accessDeniedResponse = function () {
    return ResponseGenerator.getResponseWithMessage(400, "Access Denied");
}