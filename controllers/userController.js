const User = require("../models/User");

class UserController {
  async getOrCreateUser(telegramUser) {
    const chatId = telegramUser.id.toString();
    let user = await User.findOne({ telegramId: chatId });

    if (!user) {
      user = new User({
        telegramId: chatId,
        username: telegramUser.username,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
        email: `${chatId}@biftek.uz`,
      });
      await user.save();
    }

    return user;
  }

  async updateUserPhone(userId, phone) {
    return await User.findOneAndUpdate(
      { telegramId: userId },
      { phone },
      { new: true }
    );
  }

  async updateUserAddress(userId, address) {
    return await User.findOneAndUpdate(
      { telegramId: userId },
      { address },
      { new: true }
    );
  }

  async getUserById(userId) {
    return await User.findOne({ telegramId: userId });
  }
}

module.exports = new UserController();
