const mongoose = require('mongoose');
const url =  process.env.DB_URI + "/" + process.env.DB_NAME;
//mongoose.Promise = global.Promise;
let isConnected;

module.exports.connectToDatabase = async () => {
    // console.log(isConnected);
    if (isConnected) {
        console.log('=> using existing database connection');
        return isConnected;
    }

    console.log('=> using new database connection');
    await mongoose.connect(url);
    isConnected = true;
    return isConnected;
};