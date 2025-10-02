const userController = require("../controllers/userController");
const productController = require("../controllers/productController");
const orderController = require("../controllers/orderController");
const cartController = require("../controllers/cartController");
const NotificationService = require("./notificationService");
const { formatPrice, formatOrderDetails } = require("../utils/helpers");
const { USER_STATES, COMPANY_INFO } = require("../utils/constants");
const {
  mainMenuKeyboard,
  productsKeyboard,
  personalCabinetKeyboard,
  backToMenuKeyboard,
} = require("../keyboards/mainKeyboard");
const { createProductInlineKeyboard } = require("../keyboards/productKeyboard");

// User session storage
const userSessions = {};

function getUserSession(chatId) {
  if (!userSessions[chatId]) {
    userSessions[chatId] = {
      state: USER_STATES.IDLE,
      tempOrder: null,
      tempData: {},
    };
  }
  return userSessions[chatId];
}

class TelegramBotService {
  constructor() {
    this.bot = null;
    this.notificationService = null;
  }

  init(bot) {
    this.bot = bot;
    this.notificationService = new NotificationService(bot);
    this.setupHandlers();
  }

  setupHandlers() {
    // Command handlers
    this.bot.onText(/\/start/, (msg) => this.handleStart(msg));
    this.bot.onText(/\/help/, (msg) => this.handleHelp(msg));
    this.bot.onText(/\/admin/, (msg) => this.handleAdmin(msg));

    // Message handlers
    this.bot.on("message", (msg) => this.handleMessage(msg));

    // Contact handler
    this.bot.on("contact", (msg) => this.handleContact(msg));

    // Callback query handler
    this.bot.on("callback_query", (query) => this.handleCallbackQuery(query));
  }

  async handleStart(msg) {
    const chatId = msg.chat.id;
    await userController.getOrCreateUser(msg.from);

    const welcomeMessage = `🚀 Welcome to the ${COMPANY_INFO.name} online store!
Through this bot, you can order fresh meat and meat products!

🚚 Free delivery in ${COMPANY_INFO.deliveryAreas.join(" and ")}.
☎️ ${COMPANY_INFO.phone}
🌐 ${COMPANY_INFO.website}

To get started, press any button below.`;

    this.bot.sendMessage(chatId, welcomeMessage, {
      reply_markup: mainMenuKeyboard,
    });
  }

  async handleHelp(msg) {
    const chatId = msg.chat.id;
    const helpMessage = `📖 <b>How to use the bot:</b>

🥩 <b>Products</b> - Browse our meat catalog
🛒 <b>Cart</b> - View your shopping cart
📦 <b>Place Order</b> - Create a new order
👤 <b>Personal Cabinet</b> - Manage your profile
🔍 <b>Search</b> - Find specific products

For support: ${COMPANY_INFO.phone}`;

    this.bot.sendMessage(chatId, helpMessage, { parse_mode: "HTML" });
  }

  async handleAdmin(msg) {
    const chatId = msg.chat.id;
    // Check if user is admin
    const user = await userController.getUserById(chatId.toString());

    if (!user || !user.isAdmin) {
      this.bot.sendMessage(
        chatId,
        "❌ Access denied. Admin privileges required."
      );
      return;
    }

    this.bot.sendMessage(chatId, "👨‍💼 Admin Panel - Coming soon!");
  }

  async handleMessage(msg) {
    const chatId = msg.chat.id;
    const text = msg.text;
    const session = getUserSession(chatId);

    // Skip if it's a command
    if (!text || text.startsWith("/")) return;

    // Handle different states
    if (session.state === USER_STATES.AWAITING_NAME) {
      return this.handleNameInput(chatId, text, session);
    }

    if (session.state === USER_STATES.AWAITING_ADDRESS) {
      return this.handleAddressInput(chatId, text, session);
    }

    if (session.state === USER_STATES.SEARCHING) {
      return this.handleSearch(chatId, text, session);
    }

    // Handle main menu options
    switch (text) {
      case "🥩 Products":
        return this.showProductsMenu(chatId);

      case "📋 All Products":
        return this.showAllProducts(chatId);

      case "🥩 Meat Products":
        return this.showCategoryProducts(chatId, "Meat Products");

      case "🐄 Beef":
        return this.showCategoryProducts(chatId, "Beef");

      case "🐑 Lamb":
        return this.showCategoryProducts(chatId, "Lamb");

      case "🛒 Cart":
        return this.showCart(chatId);

      case "📦 Place Order":
        return this.startOrderProcess(chatId, session);

      case "👤 Personal Cabinet":
        return this.showPersonalCabinet(chatId);

      case "📋 My Orders":
        return this.showMyOrders(chatId);

      case "📱 Phone Number":
        return this.showPhoneNumber(chatId);

      case "📍 Address":
        return this.showAddress(chatId, session);

      case "🔍 Search":
        return this.startSearch(chatId, session);

      case "⬅️ Back to Menu":
        session.state = USER_STATES.IDLE;
        return this.bot.sendMessage(chatId, "Main Menu:", {
          reply_markup: mainMenuKeyboard,
        });
    }
  }

  async handleContact(msg) {
    const chatId = msg.chat.id;
    const session = getUserSession(chatId);
    const phone = msg.contact.phone_number;

    await userController.updateUserPhone(chatId.toString(), phone);

    if (session.state === USER_STATES.AWAITING_PHONE) {
      session.tempData.phone = phone;
      this.bot.sendMessage(
        chatId,
        "✅ Thank you! Your order request has been received.\n\nOur manager will contact you shortly to confirm your order.",
        {
          reply_markup: mainMenuKeyboard,
        }
      );
      session.state = USER_STATES.IDLE;
    } else {
      this.bot.sendMessage(chatId, "✅ Phone number updated successfully!", {
        reply_markup: mainMenuKeyboard,
      });
    }
  }

  async handleCallbackQuery(query) {
    const chatId = query.message.chat.id;
    const data = query.data;

    try {
      if (data.startsWith("add_cart_")) {
        await this.handleAddToCart(chatId, data, query);
      } else if (data.startsWith("buy_now_")) {
        await this.handleBuyNow(chatId, data, query);
      } else if (data.startsWith("cart_increase_")) {
        await this.handleCartIncrease(chatId, data, query);
      } else if (data.startsWith("cart_decrease_")) {
        await this.handleCartDecrease(chatId, data, query);
      } else if (data.startsWith("cart_remove_")) {
        await this.handleCartRemove(chatId, data, query);
      } else if (data === "checkout_cart") {
        await this.handleCheckoutCart(chatId, query);
      } else if (data === "clear_cart") {
        await this.handleClearCart(chatId, query);
      }
    } catch (error) {
      console.error("Callback query error:", error);
      this.bot.answerCallbackQuery(query.id, { text: "❌ Error occurred" });
    }
  }

  // Product display methods
  async showProductsMenu(chatId) {
    this.bot.sendMessage(chatId, "Please select a category:", {
      reply_markup: productsKeyboard,
    });
  }

  async showAllProducts(chatId) {
    const products = await productController.getAllProducts();

    if (products.length === 0) {
      return this.bot.sendMessage(
        chatId,
        "❌ No products available at the moment."
      );
    }

    this.bot.sendMessage(chatId, `📦 All Products (${products.length} items):`);

    for (const product of products) {
      await this.sendProductCard(chatId, product);
    }
  }

  async showCategoryProducts(chatId, category) {
    const products = await productController.getProductsByCategory(category);

    if (products.length === 0) {
      return this.bot.sendMessage(
        chatId,
        `❌ No ${category} products available at the moment.`
      );
    }

    this.bot.sendMessage(chatId, `📦 ${category} (${products.length} items):`);

    for (const product of products) {
      await this.sendProductCard(chatId, product);
    }
  }

  async sendProductCard(chatId, product) {
    const caption = `<b>${product.name}</b>
<b>Category:</b> ${product.category}
<b>Price:</b> ${formatPrice(product.price)}

${product.description || "Fresh and quality product"}`;

    const keyboard = createProductInlineKeyboard(product._id);

    if (product.imageUrl) {
      try {
        await this.bot.sendPhoto(chatId, product.imageUrl, {
          caption: caption,
          parse_mode: "HTML",
          reply_markup: keyboard,
        });
      } catch (error) {
        // If image fails, send text message
        await this.bot.sendMessage(chatId, caption, {
          parse_mode: "HTML",
          reply_markup: keyboard,
        });
      }
    } else {
      await this.bot.sendMessage(chatId, caption, {
        parse_mode: "HTML",
        reply_markup: keyboard,
      });
    }
  }

  // Cart methods
  async showCart(chatId) {
    const cart = await cartController.getCart(chatId.toString());

    if (cart.items.length === 0) {
      return this.bot.sendMessage(
        chatId,
        "🛒 Your cart is empty.\n\nBrowse our products to add items!",
        {
          reply_markup: mainMenuKeyboard,
        }
      );
    }

    let cartMessage = "<b>🛒 Your Cart:</b>\n\n";

    for (let i = 0; i < cart.items.length; i++) {
      const item = cart.items[i];
      cartMessage += `${i + 1}. <b>${item.name}</b>\n`;
      cartMessage += `   ${formatPrice(item.price)} x ${
        item.quantity
      } = ${formatPrice(item.price * item.quantity)}\n\n`;
    }

    cartMessage += `<b>💰 Total: ${formatPrice(cart.totalAmount)}</b>`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: "✅ Checkout", callback_data: "checkout_cart" },
          { text: "🗑️ Clear Cart", callback_data: "clear_cart" },
        ],
      ],
    };

    this.bot.sendMessage(chatId, cartMessage, {
      parse_mode: "HTML",
      reply_markup: keyboard,
    });
  }

  async handleAddToCart(chatId, data, query) {
    const productId = data.split("_")[2];

    try {
      await cartController.addToCart(chatId.toString(), productId);
      this.bot.answerCallbackQuery(query.id, { text: "✅ Added to cart!" });

      // Show updated cart
      await this.showCart(chatId);
    } catch (error) {
      this.bot.answerCallbackQuery(query.id, {
        text: "❌ Error adding to cart",
      });
    }
  }

  async handleBuyNow(chatId, data, query) {
    const productId = data.split("_")[2];
    const product = await productController.getProductById(productId);

    if (!product) {
      return this.bot.answerCallbackQuery(query.id, {
        text: "❌ Product not found",
      });
    }

    const user = await userController.getUserById(chatId.toString());

    const order = await orderController.createOrderFromProduct(
      chatId.toString(),
      product._id,
      product,
      {
        customerName: user.firstName,
        customerPhone: user.phone,
        customerAddress: user.address || `${chatId}@biftek.uz`,
        customerEmail: user.email,
      }
    );

    const orderText = formatOrderDetails(order);
    this.bot.sendMessage(
      chatId,
      "✅ Order created successfully!\n\n" + orderText,
      {
        parse_mode: "HTML",
        reply_markup: mainMenuKeyboard,
      }
    );

    this.bot.answerCallbackQuery(query.id, { text: "✅ Order placed!" });
  }

  async handleCartIncrease(chatId, data, query) {
    const productId = data.split("_")[2];
    const cart = await cartController.getCart(chatId.toString());
    const item = cart.items.find((i) => i.productId.toString() === productId);

    if (item) {
      await cartController.updateQuantity(
        chatId.toString(),
        productId,
        item.quantity + 1
      );
      this.bot.answerCallbackQuery(query.id, { text: "✅ Quantity increased" });
      await this.showCart(chatId);
    }
  }

  async handleCartDecrease(chatId, data, query) {
    const productId = data.split("_")[2];
    const cart = await cartController.getCart(chatId.toString());
    const item = cart.items.find((i) => i.productId.toString() === productId);

    if (item) {
      const newQuantity = item.quantity - 1;
      await cartController.updateQuantity(
        chatId.toString(),
        productId,
        newQuantity
      );
      this.bot.answerCallbackQuery(query.id, {
        text:
          newQuantity > 0 ? "✅ Quantity decreased" : "🗑️ Removed from cart",
      });
      await this.showCart(chatId);
    }
  }

  async handleCartRemove(chatId, data, query) {
    const productId = data.split("_")[2];
    await cartController.removeFromCart(chatId.toString(), productId);
    this.bot.answerCallbackQuery(query.id, { text: "🗑️ Removed from cart" });
    await this.showCart(chatId);
  }

  async handleCheckoutCart(chatId, query) {
    const cart = await cartController.getCart(chatId.toString());

    if (cart.items.length === 0) {
      return this.bot.answerCallbackQuery(query.id, {
        text: "❌ Cart is empty",
      });
    }

    const user = await userController.getUserById(chatId.toString());

    const order = await orderController.createOrderFromCart(
      chatId.toString(),
      cart,
      {
        customerName: user.firstName,
        customerPhone: user.phone,
        customerAddress: user.address || `${chatId}@biftek.uz`,
        customerEmail: user.email,
      }
    );

    const orderText = formatOrderDetails(order);
    this.bot.sendMessage(
      chatId,
      "✅ Order created successfully!\n\n" + orderText,
      {
        parse_mode: "HTML",
        reply_markup: mainMenuKeyboard,
      }
    );

    this.bot.answerCallbackQuery(query.id, { text: "✅ Order placed!" });
  }

  async handleClearCart(chatId, query) {
    await cartController.clearCart(chatId.toString());
    this.bot.answerCallbackQuery(query.id, { text: "🗑️ Cart cleared" });
    this.bot.sendMessage(chatId, "🛒 Cart has been cleared.", {
      reply_markup: mainMenuKeyboard,
    });
  }

  // Order methods
  async startOrderProcess(chatId, session) {
    session.state = USER_STATES.AWAITING_NAME;
    session.tempData = {};
    this.bot.sendMessage(chatId, "👤 Please enter your name:");
  }

  async handleNameInput(chatId, text, session) {
    session.tempData.name = text;
    session.state = USER_STATES.AWAITING_PHONE;
    this.bot.sendMessage(chatId, "📱 Please enter your phone number:", {
      reply_markup: {
        keyboard: [[{ text: "Share Phone Number", request_contact: true }]],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
  }

  // Personal cabinet methods
  async showPersonalCabinet(chatId) {
    this.bot.sendMessage(chatId, "👤 Personal Cabinet:", {
      reply_markup: personalCabinetKeyboard,
    });
  }

  async showMyOrders(chatId) {
    const orders = await orderController.getUserOrders(chatId.toString());

    if (orders.length === 0) {
      return this.bot.sendMessage(chatId, "📭 You have no orders yet.");
    }

    this.bot.sendMessage(chatId, `📦 Your Orders (${orders.length}):`);

    for (const order of orders.slice(0, 5)) {
      const orderText = formatOrderDetails(order);
      this.bot.sendMessage(chatId, orderText, { parse_mode: "HTML" });
    }
  }

  async showPhoneNumber(chatId) {
    const user = await userController.getUserById(chatId.toString());

    if (user.phone) {
      this.bot.sendMessage(chatId, `📱 Your phone number: ${user.phone}`);
    } else {
      this.bot.sendMessage(chatId, "📱 Please share your phone number:", {
        reply_markup: {
          keyboard: [[{ text: "Share Phone Number", request_contact: true }]],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      });
    }
  }

  async showAddress(chatId, session) {
    const user = await userController.getUserById(chatId.toString());

    if (user.address) {
      this.bot.sendMessage(
        chatId,
        `📍 Your address: ${user.address}\n\nTo update, send a new address.`
      );
    } else {
      this.bot.sendMessage(chatId, "📍 Please enter your delivery address:");
    }

    session.state = USER_STATES.AWAITING_ADDRESS;
  }

  async handleAddressInput(chatId, text, session) {
    await userController.updateUserAddress(chatId.toString(), text);

    this.bot.sendMessage(chatId, "✅ Address updated successfully!", {
      reply_markup: mainMenuKeyboard,
    });

    session.state = USER_STATES.IDLE;
  }

  // Search methods
  async startSearch(chatId, session) {
    session.state = USER_STATES.SEARCHING;
    this.bot.sendMessage(chatId, "🔍 Please enter a search keyword:");
  }

  async handleSearch(chatId, text, session) {
    const products = await productController.searchProducts(text);

    if (products.length === 0) {
      this.bot.sendMessage(
        chatId,
        "❌ No products found matching your search."
      );
    } else {
      this.bot.sendMessage(chatId, `🔍 Found ${products.length} product(s):`);

      for (const product of products) {
        await this.sendProductCard(chatId, product);
      }
    }

    session.state = USER_STATES.IDLE;
    this.bot.sendMessage(chatId, "What would you like to do next?", {
      reply_markup: mainMenuKeyboard,
    });
  }
}

module.exports = new TelegramBotService();
