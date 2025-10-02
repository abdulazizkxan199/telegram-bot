require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const connectDB = require("./config/database");
const telegramBotService = require("./services/telegramBot");

// Connect to MongoDB
connectDB();

// Initialize bot
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Initialize bot service
telegramBotService.init(bot);

// Error handling
bot.on("polling_error", (error) => {
  console.error("❌ Polling error:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("❌ Unhandled rejection:", error);
});

console.log("🤖 Biftek Bot is running...");
