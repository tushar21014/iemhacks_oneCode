const mongoose = require('mongoose');
require("dotenv").config()
async function connectToMongo() {
    try {
        await mongoose.connect(process.env.URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB Messaging Server');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

connectToMongo();

module.exports = connectToMongo;
