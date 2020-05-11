'use strict';

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    category: {
        type: String,
        unique: true
    },
    catImageUri: {
        type: String
    },
    subCat: [
        {
            subCategory: String,
            subCatImageUri: String
        }
    ]
});

var Category = mongoose.model('Category', categorySchema, process.env.DB_CATEGORIES_COLLECTION);

module.exports = Category;