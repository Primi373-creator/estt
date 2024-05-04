const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    chatId: String,
    username: String,
    banned: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('User', UserSchema);
