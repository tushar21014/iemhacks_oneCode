const mongoose = require('mongoose');

const { Schema } = mongoose;


const userSchema = new Schema({
    username:{
        type:String,
        required: true
    },
    email:{
        type:String,
        required: true
    },
    pass:{
        type:String,
        required: true
    },
    isOnline:{
        type:Boolean,
        required: true,
        default: false
    },
    isOffline:{
        type:Boolean,
        required: true,
        default: true
    },
    isFree:{
        type:Boolean,
        required: true,
        default: false
    },
    currentConnection:{
        type:String
    },
    socketId:{
        type:String
    },
    date: {
        type: Date,
        default: Date.now
    },
}, { timestamps: true });

const user = mongoose.model('Users', userSchema)
module.exports = user;