'use strict';

const mongoose = require('mongoose');
const CategoryManager = require('../functions/category-manager');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    storeIds: [
        {
            type: String
        }
    ],
    options: [
        {
            type: String
        }
    ],
    category: {
        type: String,
        required: true
    },
    subCategory : {
        type: String,
        required: true
    },
    imageUri: String,
    approval: {
        status: String,
        approvedBy: String
    }
});

// productSchema.pre('save', function (next) {
//     if(this.approval == null) {
//         this['approval'] = {
//             status: "Not Approved"
//         }
//     }
//     next();
// });

productSchema.methods.matchCatAndSub = async function () {
    const product = this;
    return await CategoryManager.checkCatAndSub(product.category, product.subCategory);
}

productSchema.methods.addAttributes = async function(user) {
    var product = this;
    if(user.userType === 'store') {
        product['storeIds'] = [
            user.userId
        ];
        product['approval'] = {
            status: "Not Approved"
        };
        return;
    }
    if(user.userType === 'admin') {
        product['approval'] = {
            status: "Approved",
            approvedBy: user.userId
        };
        return;
    }
}

var Product = mongoose.model('Product', productSchema, process.env.DB_PRODUCTS_COLLECTION);

module.exports = Product;