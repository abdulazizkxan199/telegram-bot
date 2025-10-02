const createProductInlineKeyboard = (productId) => {
  return {
    inline_keyboard: [
      [
        { text: "🛒 Savatga qo‘shish", callback_data: `add_cart_${productId}` },
        {
          text: "💳 Hozir xarid qilish",
          callback_data: `buy_now_${productId}`,
        },
      ],
    ],
  };
};

const createCartItemKeyboard = (productId) => {
  return {
    inline_keyboard: [
      [
        { text: "➖", callback_data: `cart_decrease_${productId}` },
        { text: "➕", callback_data: `cart_increase_${productId}` },
      ],
      [{ text: "🗑️ O‘chirish", callback_data: `cart_remove_${productId}` }],
    ],
  };
};

module.exports = {
  createProductInlineKeyboard,
  createCartItemKeyboard,
};
