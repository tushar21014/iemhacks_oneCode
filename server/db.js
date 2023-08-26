const mongoose = require('mongoose');

async function connectToMongo() {
    try {
        // await mongoose.connect('mongodb+srv://tusharlps31:JHGP1NHFvhsenu0E@zomaggy.bqfatbu.mongodb.net/?retryWrites=true&w=majority', {
        mongoose.connect('mongodb://127.0.0.1:27017/Messaging', {
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
