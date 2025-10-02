class NotificationService {
  constructor(bot) {
    this.bot = bot;
  }

  async notifyOrderCreated(chatId, order) {
    const message = `✅ <b>Buyurtma muvaffaqiyatli yaratildi!</b>\n\nBuyurtma #${order.orderId}\nJami: ${order.totalAmount} UZS\n\nMenejerimiz tez orada siz bilan bog‘lanadi!`;
    await this.bot.sendMessage(chatId, message, { parse_mode: "HTML" });
  }

  async notifyOrderStatusChange(chatId, orderId, newStatus) {
    const statusEmojis = {
      pending: "⏳",
      processing: "🔄",
      confirmed: "✅",
      shipped: "🚚",
      delivered: "📦",
      cancelled: "❌",
    };

    const emoji = statusEmojis[newStatus] || "📋";
    const message = `${emoji} <b>Buyurtma holati yangilandi</b>\n\nOrder #${orderId}\nYangi holat: ${newStatus}`;
    await this.bot.sendMessage(chatId, message, { parse_mode: "HTML" });
  }

  async notifyAdmin(adminChatId, message) {
    await this.bot.sendMessage(
      adminChatId,
      `🔔 <b>Admin bildirishnomasi</b>\n\n${message}`,
      {
        parse_mode: "HTML",
      }
    );
  }
}

module.exports = NotificationService;
