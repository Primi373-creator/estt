const TelegramBot = require("node-telegram-bot-api");
const mongoose = require("mongoose");
const config = require("./config");
const client = require("./lib/bot/client");

mongoose.connect(config.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const bot = new TelegramBot(config.TOKEN, { polling: true });
new client(bot);
