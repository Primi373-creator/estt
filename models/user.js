const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  chatId: String,
  username: String,
  isban: {
    type: Boolean,
    default: false,
  },
  isadmin: {
    type: Boolean,
    default: false,
  },
  issub: {
    type: Boolean,
    default: false,
  },
  aniserv: {
    type: String,
    default: "gogoanime",
  },
  mangserv: {
    type: String,
    default: "mangakakalot",
  },
});

module.exports = mongoose.model("User", UserSchema);
