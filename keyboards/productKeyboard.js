const createProductInlineKeyboard = (productId) => {
  return {
    inline_keyboard: [
      [
        { text: "🛒 Add to Cart", callback_data: `add_cart_${productId}` },
        { text: "💳 Buy Now", callback_data: `buy_now_${productId}` },
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
      [{ text: "🗑️ Remove", callback_data: `cart_remove_${productId}` }],
    ],
  };
};

module.exports = {
  createProductInlineKeyboard,
  createCartItemKeyboard,
};
