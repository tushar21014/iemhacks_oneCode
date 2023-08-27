const mongoose = require('mongoose');

const { Schema } = mongoose;


const userSchema = new Schema({
    username:{
        type:String,
        required: true,
        unique: true
    },
    verify_token: {
        type : String
    },
    email:{
        type:String,
        required: true,
        unique: true
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
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    friendTimerExpires: {
        type: Date,
        default: null
    },
    date: {
        type: Date,
        default: Date.now
    },
}, { timestamps: true });

const user = mongoose.model('Users', userSchema)
module.exports = user;