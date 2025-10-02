class NotificationService {
  constructor(bot) {
    this.bot = bot;
  }

  async notifyOrderCreated(chatId, order) {
    const message = `✅ <b>Order Created Successfully!</b>\n\nOrder #${order.orderId}\nTotal: ${order.totalAmount} UZS\n\nOur manager will contact you shortly!`;
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
    const message = `${emoji} <b>Order Status Updated</b>\n\nOrder #${orderId}\nNew Status: ${newStatus}`;
    await this.bot.sendMessage(chatId, message, { parse_mode: "HTML" });
  }

  async notifyAdmin(adminChatId, message) {
    await this.bot.sendMessage(
      adminChatId,
      `🔔 <b>Admin Notification</b>\n\n${message}`,
      {
        parse_mode: "HTML",
      }
    );
  }
}

module.exports = NotificationService;
