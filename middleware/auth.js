const User = require("../models/User");

const checkAdmin = async (userId) => {
  const user = await User.findOne({ telegramId: userId.toString() });
  return user && user.isAdmin;
};

const requireAdmin = async (userId) => {
  const isAdmin = await checkAdmin(userId);
  if (!isAdmin) {
    throw new Error("Unauthorized: Admin access required");
  }
  return true;
};

module.exports = {
  checkAdmin,
  requireAdmin,
};
