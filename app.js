require("dotenv").config();
const connectDB = require("./config/database");
const TelegramBot = require("node-telegram-bot-api");
const TelegramBotService = require("./services/telegramBot"); // Class import
const express = require("express");

// Connect to MongoDB
connectDB();

const app = express();
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Middleware
app.use(express.json());

const telegramBotService = new TelegramBotService();
telegramBotService.init(bot);

app.get("/", (_, res) => {
  res.json({ status: "Bot is running!" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Bot is running...");
});
