const mainMenuKeyboard = {
  keyboard: [
    ["📦 Mahsulotlar", "🛒 Savat"],
    ["📦 Buyurtma berish", "👤 Shaxsiy kabinet"],
    ["🔍 Qidiruv"],
  ],
  resize_keyboard: true,
};

const productsKeyboard = {
  keyboard: [
    ["📋 Barcha mahsulotlar"],
    ["🥩 Go‘sht mahsulotlari", "🐄 Mol go‘shti", "🐑 Qo‘y go‘shti"],
    ["⬅️ Menyuga qaytish"],
  ],
  resize_keyboard: true,
};

const personalCabinetKeyboard = {
  keyboard: [
    ["📋 Mening buyurtmalarim"],
    ["📱 Telefon raqam", "📍 Manzil"],
    ["⬅️ Menyuga qaytish"],
  ],
  resize_keyboard: true,
};

const backToMenuKeyboard = {
  keyboard: [["⬅️ Menyuga qaytish"]],
  resize_keyboard: true,
};

module.exports = {
  mainMenuKeyboard,
  productsKeyboard,
  personalCabinetKeyboard,
  backToMenuKeyboard,
};
