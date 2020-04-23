const mongoose = require('mongoose');

const productPriceSchema = new mongoose.Schema({
    storeId: {
        type: String,
        required: true
    },
    proId: {
        type: String,
        required: true
    },
    pricing: [
        {
            options: String,
            price: Number
        }
    ]
});

productPriceSchema.methods.addPricing = async function (productPrice) {
    const newPricing = productPrice.pricing;
    newPricing.forEach(element => {
        const index = this.pricing.findIndex( x => x.options === element.options)
        if(index===-1) {
            this.pricing.push(element);
        } else {
            this.pricing[index].price = element.price;
        }
    });
}

var ProductPrice = mongoose.model('ProductPrice', productPriceSchema, process.env.DB_PRODUCTS_PRICE_COLLECTION);

module.exports = ProductPrice;