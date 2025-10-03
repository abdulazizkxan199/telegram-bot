require("dotenv").config();
const connectDB = require("./config/database");
const TelegramBot = require("node-telegram-bot-api");
const TelegramBotService = require("./services/telegramBot");
const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await connectDB();
    console.log("MongoDB connected successfully 🚀");

    let bot;

    if (process.env.NODE_ENV === "production") {
      // ✅ Webhook URL path (tokenni yashirin qilish uchun /webhook/ dan foydalanamiz)
      const webhookUrlPath = `/webhook/${process.env.BOT_TOKEN}`;
      const fullWebhookUrl = `${process.env.APP_URL}${webhookUrlPath}`;

      // ✅ Bot obyektini yaratish
      bot = new TelegramBot(process.env.BOT_TOKEN, { webHook: true });

      // ✅ Webhookni set qilish
      try {
        await bot.setWebHook(fullWebhookUrl);
        console.log(`Webhook successfully set to: ${fullWebhookUrl}`);
      } catch (error) {
        console.error("🔴 ERROR setting WebHook:", error.message);
      }

      // ✅ Webhook route (Telegram POST qiladigan joy)
      app.post(webhookUrlPath, (req, res) => {
        bot.processUpdate(req.body);
        res.sendStatus(200); // Juda muhim!
      });

      console.log("Bot is running in webhook mode (production)...");
    } else {
      // ✅ Development: polling mode
      bot = new TelegramBot(process.env.BOT_TOKEN);
      console.log("Bot is running in polling mode (development)...");
    }

    // ✅ Sizning xizmatlaringiz
    TelegramBotService.init(bot);

    // ✅ Test uchun GET route
    app.get("/", (_, res) => {
      res.json({ status: "Bot server is running! 🚀" });
    });

    // ✅ Express serverini ishga tushirish
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} 🚀`);
      console.log(`Available at: ${process.env.APP_URL}`);
    });
  } catch (error) {
    console.error("❌ Critical Error starting the bot:", error);
  }
}

start();
