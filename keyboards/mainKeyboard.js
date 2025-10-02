const { Keyboard } = require("telegram-keyboard");

const mainMenuKeyboard = {
  keyboard: [
    ["🥩 Products", "🛒 Cart"],
    ["📦 Place Order", "👤 Personal Cabinet"],
    ["🔍 Search"],
  ],
  resize_keyboard: true,
};

const productsKeyboard = {
  keyboard: [
    ["📋 All Products"],
    ["🥩 Meat Products", "🐄 Beef", "🐑 Lamb"],
    ["⬅️ Back to Menu"],
  ],
  resize_keyboard: true,
};

const personalCabinetKeyboard = {
  keyboard: [
    ["📋 My Orders"],
    ["📱 Phone Number", "📍 Address"],
    ["⬅️ Back to Menu"],
  ],
  resize_keyboard: true,
};

const backToMenuKeyboard = {
  keyboard: [["⬅️ Back to Menu"]],
  resize_keyboard: true,
};

module.exports = {
  mainMenuKeyboard,
  productsKeyboard,
  personalCabinetKeyboard,
  backToMenuKeyboard,
};
