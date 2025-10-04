require("dotenv").config();
const connectDB = require("./config/database");
const TelegramBot = require("node-telegram-bot-api");
const TelegramBotService = require("./services/telegramBot");
const express = require("express");
const router = require("./router/router");
const cors = require("cors");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use(cors());

async function start() {
  try {
    await connectDB();
    console.log("MongoDB connected successfully 🚀");

    let bot;

    if (process.env.NODE_ENV === "production") {
      const webhookUrlPath = `/webhook/${process.env.BOT_TOKEN}`;
      const fullWebhookUrl = `${process.env.APP_URL}${webhookUrlPath}`;

      bot = new TelegramBot(process.env.BOT_TOKEN, { webHook: true });

      try {
        await bot.setWebHook(fullWebhookUrl);
        console.log(`Webhook successfully set to: ${fullWebhookUrl}`);
      } catch (error) {
        console.error("🔴 ERROR setting WebHook:", error.message);
      }

      app.post(webhookUrlPath, (req, res) => {
        bot.processUpdate(req.body);
        res.sendStatus(200);
      });

      console.log("Bot is running in webhook mode (production)...");
    } else {
      bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
      console.log("Bot is running in polling mode (development)...");
    }

    TelegramBotService.init(bot);

    app.get("/", (_, res) => {
      res.json({ status: "Bot server is running! 🚀" });
    });

    app.use("/api", router);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} 🚀`);
      console.log(`Available at: ${process.env.APP_URL}`);
    });
  } catch (error) {
    console.error("❌ Critical Error starting the bot:", error);
  }
}

start();
