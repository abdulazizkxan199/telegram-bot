require("dotenv").config();
const connectDB = require("./config/database");
const TelegramBot = require("node-telegram-bot-api");
const TelegramBotService = require("./services/telegramBot"); // Xizmatingiz saqlab qolindi
const express = require("express");

const app = express();
app.use(express.json());

// Render.com foydalanishi kerak bo'lgan PORT o'zgaruvchisini aniqlash
const PORT = process.env.PORT || 3000; 
// process.env.PORT Render tomonidan avtomatik belgilanadi. Agar yo'q bo'lsa, 3000 ishlatiladi.

async function start() {
    try {
        await connectDB();
        console.log("MongoDB connected successfully 🚀");

        // Telegram botni yaratish
        let bot;
        
        if (process.env.NODE_ENV === "production") {
            // Production: webhook mode
            const webhookUrlPath = `/bot${process.env.BOT_TOKEN}`;
            const fullWebhookUrl = `${process.env.APP_URL}${webhookUrlPath}`;
            
            // Bot obyektini yaratishda webhook sozlamalarini, ayniqsa PORTni belgilash
            bot = new TelegramBot(process.env.BOT_TOKEN, {
                webHook: {
                    port: PORT // Server tinglayotgan portni ko'rsatish
                }
            });

            // Webhookni o'rnatish: Ulanish xatosini tutib olish uchun try/catch blokiga olinadi.
            // Bu asinxron operatsiya ekanligini hisobga olib, await ishlatildi.
            try {
                await bot.setWebHook(fullWebhookUrl);
                console.log(`Webhook successfully set to: ${fullWebhookUrl}`);
            } catch (error) {
                // Agar setWebHook Telegram API'ga ulanolmasa ham, server ishlashda davom etadi.
                console.error("🔴 ERROR setting WebHook (Possible Telegram API access issue):", error.message);
            }
            
            // Webhook so'rovlarini qabul qiluvchi POST route
            app.post(webhookUrlPath, (req, res) => {
                bot.processUpdate(req.body);
                // Telegramga tezda 200 OK javobini qaytarish juda muhim
                res.sendStatus(200); 
            });

            console.log("Bot is running in webhook mode (production)...");
            
        } else {
            // Development: polling mode
            bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
            console.log("Bot is running in polling mode (development)...");
        }

        // Bot xizmatlarini ishga tushirish (Sizning mantiqingiz joylashgan joy)
        TelegramBotService.init(bot);

        // Serverning ishlashini tekshirish uchun GET route
        app.get("/", (_, res) => {
            res.json({ status: "Bot server is running! 🚀" });
        });

        // Express serverini ishga tushirish
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT} 🚀`);
            console.log(`Available at: ${process.env.APP_URL}`);
        });
        
    } catch (error) {
        // Agar MongoDB yoki boshqa muhim ulanishda xato bo'lsa, logga yozadi
        console.error("❌ Critical Error starting the bot:", error);
    }
}

start();
