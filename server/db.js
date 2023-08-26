const mongoose = require('mongoose');

async function connectToMongo() {
    try {
        // await mongoose.connect('mongodb+srv://tusharlps31:JHGP1NHFvhsenu0E@zomaggy.bqfatbu.mongodb.net/?retryWrites=true&w=majority', {
        await mongoose.connect('mongodb+srv://oneCode:wVqTFqBPSyYNBv8@onecode.odzsgs3.mongodb.net/', {
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