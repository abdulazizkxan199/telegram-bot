require("dotenv").config();
const connectDB = require("./config/database");
const TelegramBot = require("node-telegram-bot-api");
const TelegramBotService = require("./services/telegramBot");
const express = require("express");

const app = express();
app.use(express.json());

async function start() {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;

    // Telegram bot init
    let bot;
    if (process.env.NODE_ENV === "production") {
      // Production: webhook mode
      bot = new TelegramBot(process.env.BOT_TOKEN);
      const url = process.env.APP_URL; // Render.com URL
      bot.setWebHook(`${url}/bot${process.env.BOT_TOKEN}`);

      app.post(`/bot${process.env.BOT_TOKEN}`, (req, res) => {
        bot.processUpdate(req.body);
        res.sendStatus(200);
      });

      console.log("Bot is running in webhook mode (production)...");
    } else {
      // Development: polling mode
      bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
      console.log("Bot is running in polling mode (development)...");
    }

    TelegramBotService.init(bot);

    app.get("/", (_, res) => {
      res.json({ status: "Bot is running! 🚀" });
    });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} 🚀`);
    });
  } catch (error) {
    console.error("Error starting the bot:", error);
  }
}

start();
