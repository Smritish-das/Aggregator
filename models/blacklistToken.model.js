const mongoose = require('mongoose');

const blacklistTokenSchema = new mongoose.Schema({
    token:{
        type:String,
        required:true,
        unique:true
    },
    createdAt:{
        type:Date,
        default:Date.now,
        expires: 604800
    }
})

const blacklistTokenModal = mongoose.model('BlacklistToken',blacklistTokenSchema);

module.exports = blacklistTokenModal; 