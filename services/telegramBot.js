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

    // Inline query handler
    this.bot.on("inline_query", (query) => {
      console.log("INLINE QUERY KELDI:", query); // 👈 Terminalda ko‘ring
      this.handleInlineQuery(query);
    });
  }

  // inline query natija — faqat product id yuboradi
  async handleInlineQuery(query) {
    let products;

    if (query.query.toLowerCase() === "all") {
      products = await productController.getAllProducts();
    } else {
      products = await productController.getProductsByCategory(query.query);
    }

    const results = products.map((p, idx) => ({
      type: "article",
      id: String(p._id || idx),
      title: p.name,
      description: `${p.price} UZS`,
      thumb_url: p.imageUrl || "https://via.placeholder.com/100",
      input_message_content: {
        message_text: `product:${p._id}`, // faqat product id ni yuboramiz
      },
    }));

    await this.bot.answerInlineQuery(query.id, results, { cache_time: 0 });
  }

  async handleStart(msg) {
    const chatId = msg.chat.id;
    await userController.getOrCreateUser(msg.from);

    const welcomeMessage = `🚀 ${
      COMPANY_INFO.name
    } onlayn do‘koniga xush kelibsiz!
Ushbu bot orqali siz yangi go‘sht va go‘sht mahsulotlariga buyurtma bera olasiz!

🚚 Yetkazib berish bepul: ${COMPANY_INFO.deliveryAreas.join(" va ")}.
☎️ ${COMPANY_INFO.phone}
🌐 ${COMPANY_INFO.website}

Boshlash uchun pastdagi tugmalardan birini bosing.
`;

    this.bot.sendMessage(chatId, welcomeMessage, {
      reply_markup: mainMenuKeyboard,
    });
  }

  async handleHelp(msg) {
    const chatId = msg.chat.id;
    const helpMessage = `📖 <b>Botdan foydalanish bo‘yicha qo‘llanma:</b>

🥩 <b>Mahsulotlar</b> - Go‘sht katalogimizni ko‘rib chiqing  
🛒 <b>Savat</b> - Xarid savatingizni ko‘ring  
📦 <b>Buyurtma berish</b> - Yangi buyurtma yarating  
👤 <b>Shaxsiy kabinet</b> - Profilingizni boshqaring  
🔍 <b>Qidiruv</b> - Maxsus mahsulotlarni toping  

Qo‘llab-quvvatlash uchun: ${COMPANY_INFO.phone}
`;

    this.bot.sendMessage(chatId, helpMessage, { parse_mode: "HTML" });
  }

  async handleAdmin(msg) {
    const chatId = msg.chat.id;
    // Check if user is admin
    const user = await userController.getUserById(chatId.toString());

    if (!user || !user.isAdmin) {
      this.bot.sendMessage(
        chatId,
        "❌ Kirish rad etildi. Admin huquqlari talab qilinadi."
      );
      return;
    }

    this.bot.sendMessage(chatId, "👨‍💼 Admin Panel – Tez orada!");
  }

  async handleMessage(msg) {
    const chatId = msg.chat.id;
    const text = msg.text;
    const session = getUserSession(chatId);

    // Skip if it's a command
    if (!text || text.startsWith("/")) return;

    if (msg.text && msg.text.startsWith("product:")) {
      const productId = msg.text.split(":")[1];

      await this.bot.deleteMessage(chatId, msg.message_id).catch(() => {});

      const product = await productController.getProductById(productId);

      if (!product) {
        return this.bot.sendMessage(chatId, "Mahsulot topilmadi ❌");
      }

      await this.sendProductCard(chatId, product);
    }

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
      case "🥩 Mahsulotlar":
        return this.bot.sendMessage(chatId, "📦 Mahsulotlarni qidirish:", {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "📋 Barcha mahsulotlar",
                  switch_inline_query_current_chat: "all",
                },
              ],
              [
                {
                  text: "Idishlar",
                  switch_inline_query_current_chat: "Idishlar",
                },
              ],
              [
                {
                  text: "Maishiy tehnika",
                  switch_inline_query_current_chat: "Maishiy tehnika",
                },
              ],
              [
                {
                  text: "Mebel",
                  switch_inline_query_current_chat: "Mebel",
                },
              ],
              [
                {
                  text: "Oshxona texnikalari",
                  switch_inline_query_current_chat: "Oshxona texnikalari",
                },
              ],
            ],
          },
        });

      // case "📋 Barcha mahsulotlar":
      //   return this.showAllProducts(chatId);

      // case "🥩 Go‘sht mahsulotlari":
      //   return this.showCategoryProducts(chatId, "Meat Products");

      // case "🐄 Mol go‘shti":
      //   return this.showCategoryProducts(chatId, "Lamb");

      // case "🐑 Qo‘y go‘shti":
      //   return this.showCategoryProducts(chatId, "Beef");

      case "🛒 Savat":
        return this.showCart(chatId);

      case "📦 Buyurtma berish":
        return this.startOrderProcess(chatId, session);

      case "👤 Shaxsiy kabinet":
        return this.showPersonalCabinet(chatId);

      case "📋 Mening buyurtmalarim":
        return this.showMyOrders(chatId);

      case "📱 Telefon raqam":
        return this.showPhoneNumber(chatId);

      case "📍 Manzil":
        return this.showAddress(chatId, session);

      case "🔍 Qidiruv":
        return this.startSearch(chatId, session);

      case "⬅️ Menyuga qaytish":
        session.state = USER_STATES.IDLE;
        return this.bot.sendMessage(chatId, "Asosiy menyu:", {
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
        "✅ Rahmat! Buyurtmangiz qabul qilindi.\n\n📞 Menejerimiz tez orada siz bilan bog‘lanib, buyurtmangizni tasdiqlaydi.",
        {
          reply_markup: mainMenuKeyboard,
        }
      );
      session.state = USER_STATES.IDLE;
    } else {
      this.bot.sendMessage(
        chatId,
        "✅ Telefon raqamingiz muvaffaqiyatli yangilandi!",
        {
          reply_markup: mainMenuKeyboard,
        }
      );
    }
  }

  async handleCallbackQuery(query) {
    try {
      const data = query.data;
      let chatId = null;

      if (query.message) {
        chatId = query.message.chat.id;
      } else if (query.inline_message_id) {
        console.log("INLINE CALLBACK:", data, query.inline_message_id);
      }

      if (!data) {
        return this.bot.answerCallbackQuery(query.id, {
          text: "❌ Noto‘g‘ri tugma",
        });
      }

      // Endi tugmalarni handle qilish
      if (data.startsWith("add_cart_")) {
        if (chatId) await this.handleAddToCart(chatId, data, query);
      } else if (data.startsWith("buy_now_")) {
        if (chatId) await this.handleBuyNow(chatId, data, query);
      } else if (data.startsWith("cart_increase_")) {
        if (chatId) await this.handleCartIncrease(chatId, data, query);
      } else if (data.startsWith("cart_decrease_")) {
        if (chatId) await this.handleCartDecrease(chatId, data, query);
      } else if (data.startsWith("cart_remove_")) {
        if (chatId) await this.handleCartRemove(chatId, data, query);
      } else if (data === "checkout_cart") {
        if (chatId) await this.handleCheckoutCart(chatId, query);
      } else if (data === "clear_cart") {
        if (chatId) await this.handleClearCart(chatId, query);
      }

      // Callback javobini qaytarish
      await this.bot.answerCallbackQuery(query.id);
    } catch (error) {
      console.error("❌ Callback so‘rovida xatolik:", error);
      this.bot.answerCallbackQuery(query.id, { text: "❌ Xatolik yuz berdi" });
    }
  }

  // Product display methods
  async showProductsMenu(chatId) {
    this.bot.sendMessage(chatId, "Iltimos, kategoriya tanlang:", {
      reply_markup: productsKeyboard,
    });
  }

  async showAllProducts(chatId) {
    const products = await productController.getAllProducts();

    if (products.length === 0) {
      return this.bot.sendMessage(
        chatId,
        "❌ Hozircha mahsulotlar mavjud emas."
      );
    }

    this.bot.sendMessage(
      chatId,
      `📦 Barcha mahsulotlar (${products.length} ta): `
    );

    for (const product of products) {
      await this.sendProductCard(chatId, product);
    }
  }

  async showCategoryProducts(chatId, category) {
    const products = await productController.getProductsByCategory(category);

    if (products.length === 0) {
      return this.bot.sendMessage(
        chatId,
        `❌ Hozircha ${category} mahsulotlari mavjud emas.`
      );
    }

    this.bot.sendMessage(chatId, `${category} (${products.length} ta):`);

    for (const product of products) {
      await this.sendProductCard(chatId, product);
    }
  }

  async sendProductCard(chatId, product) {
    const caption = `<b>${product.name}</b>
<b>Kategoriya:</b> ${product.category}
<b>Narx:</b> ${formatPrice(product.price)}

${product.description || "Yangi va sifatli mahsulot"}`;

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
        "🛒 Savatingiz bo‘sh.\n\nMahsulotlarimizni ko‘rib chiqing va savatga qo‘shing!",
        {
          reply_markup: mainMenuKeyboard,
        }
      );
    }

    let cartMessage = "<b>🛒 Savatingiz:</b>\n\n";

    for (let i = 0; i < cart.items.length; i++) {
      const item = cart.items[i];
      cartMessage += `${i + 1}. <b>${item.name}</b>\n`;
      cartMessage += `   ${formatPrice(item.price)} x ${
        item.quantity
      } = ${formatPrice(item.price * item.quantity)}\n\n`;
    }

    cartMessage += `<b>💰 Jami: ${formatPrice(cart.totalAmount)}</b>`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: "✅ Buyurtma berish", callback_data: "checkout_cart" },
          { text: "🧹 Savatni tozalash", callback_data: "clear_cart" },
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
      this.bot.answerCallbackQuery(query.id, { text: "✅ Savatga qo‘shildi!" });

      // Show updated cart
      await this.showCart(chatId);
    } catch (error) {
      this.bot.answerCallbackQuery(query.id, {
        text: "❌ Savatga qo‘shishda xatolik yuz berdi",
      });
    }
  }

  async handleBuyNow(chatId, data, query) {
    const productId = data.split("_")[2];
    const product = await productController.getProductById(productId);

    if (!product) {
      return this.bot.answerCallbackQuery(query.id, {
        text: "❌ Mahsulot topilmadi",
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
      "✅ Buyurtma muvaffaqiyatli yaratildi!\n\n" + orderText,
      {
        parse_mode: "HTML",
        reply_markup: mainMenuKeyboard,
      }
    );

    this.bot.answerCallbackQuery(query.id, { text: "✅ Buyurtma berildi!" });
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
      this.bot.answerCallbackQuery(query.id, { text: "✅ Miqdor oshirildi" });
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
          newQuantity > 0
            ? "✅ Miqdor kamaytirildi"
            : "🗑️ Savatdan olib tashlandi",
      });
      await this.showCart(chatId);
    }
  }

  async handleCartRemove(chatId, data, query) {
    const productId = data.split("_")[2];
    await cartController.removeFromCart(chatId.toString(), productId);
    this.bot.answerCallbackQuery(query.id, {
      text: "🗑️ Savatdan olib tashlandi",
    });
    await this.showCart(chatId);
  }

  async handleCheckoutCart(chatId, query) {
    const cart = await cartController.getCart(chatId.toString());

    if (cart.items.length === 0) {
      return this.bot.answerCallbackQuery(query.id, {
        text: "🛒 Savat bo‘sh",
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
      "✅ Buyurtma muvaffaqiyatli yaratildi!\n\n" + orderText,
      {
        parse_mode: "HTML",
        reply_markup: mainMenuKeyboard,
      }
    );

    this.bot.answerCallbackQuery(query.id, { text: "✅ Buyurtma berildi!" });
  }

  async handleClearCart(chatId, query) {
    await cartController.clearCart(chatId.toString());
    this.bot.answerCallbackQuery(query.id, { text: "🧹 Savat tozalandi" });
    this.bot.sendMessage(chatId, "🧹 Savat tozalandi.", {
      reply_markup: mainMenuKeyboard,
    });
  }

  // Order methods
  async startOrderProcess(chatId, session) {
    session.state = USER_STATES.AWAITING_NAME;
    session.tempData = {};
    this.bot.sendMessage(chatId, "👤 Iltimos, ismingizni kiriting:");
  }

  async handleNameInput(chatId, text, session) {
    session.tempData.name = text;
    session.state = USER_STATES.AWAITING_PHONE;
    this.bot.sendMessage(chatId, "📱 Iltimos, telefon raqamingizni kiriting:", {
      reply_markup: {
        keyboard: [
          [{ text: "Telefon raqamni ulashish", request_contact: true }],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
  }

  // Personal cabinet methods
  async showPersonalCabinet(chatId) {
    this.bot.sendMessage(chatId, "👤 Shaxsiy kabinet:", {
      reply_markup: personalCabinetKeyboard,
    });
  }

  async showMyOrders(chatId) {
    const orders = await orderController.getUserOrders(chatId.toString());

    if (orders.length === 0) {
      return this.bot.sendMessage(
        chatId,
        "📭 Sizda hali hech qanday buyurtma yo‘q."
      );
    }

    this.bot.sendMessage(chatId, `📦 Buyurtmalaringiz (${orders.length}):`);

    for (const order of orders.slice(0, 5)) {
      const orderText = formatOrderDetails(order);
      this.bot.sendMessage(chatId, orderText, { parse_mode: "HTML" });
    }
  }

  async showPhoneNumber(chatId) {
    const user = await userController.getUserById(chatId.toString());

    if (user.phone) {
      this.bot.sendMessage(chatId, `📱 Telefon raqamingiz: ${user.phone}`);
    } else {
      this.bot.sendMessage(
        chatId,
        "📱 Iltimos, telefon raqamingizni ulashing:",
        {
          reply_markup: {
            keyboard: [
              [{ text: "Telefon raqamni ulashish", request_contact: true }],
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        }
      );
    }
  }

  async showAddress(chatId, session) {
    const user = await userController.getUserById(chatId.toString());

    if (user.address) {
      this.bot.sendMessage(
        chatId,
        `📍 Manzilingiz: ${user.address}\n\nYangilash uchun, yangi manzil yuboring.`
      );
    } else {
      this.bot.sendMessage(
        chatId,
        "📍 Iltimos, yetkazib berish manzilingizni kiriting:"
      );
    }

    session.state = USER_STATES.AWAITING_ADDRESS;
  }

  async handleAddressInput(chatId, text, session) {
    await userController.updateUserAddress(chatId.toString(), text);

    this.bot.sendMessage(chatId, "✅ Manzil muvaffaqiyatli yangilandi!", {
      reply_markup: mainMenuKeyboard,
    });

    session.state = USER_STATES.IDLE;
  }

  // Search methods
  async startSearch(chatId, session) {
    session.state = USER_STATES.SEARCHING;
    this.bot.sendMessage(chatId, "🔍 Iltimos, qidiruv uchun so‘z kiriting:");
  }

  async handleSearch(chatId, text, session) {
    const products = await productController.searchProducts(text);

    if (products.length === 0) {
      this.bot.sendMessage(
        chatId,
        "❌ Qidiruvingiz bo‘yicha mahsulot topilmadi."
      );
    } else {
      this.bot.sendMessage(
        chatId,
        `🔍 ${products.length} ta mahsulot topildi:`
      );

      for (const product of products) {
        await this.sendProductCard(chatId, product);
      }
    }

    session.state = USER_STATES.IDLE;
    this.bot.sendMessage(chatId, "➡️ Keyingi qadamda nima qilmoqchisiz?", {
      reply_markup: mainMenuKeyboard,
    });
  }
}

module.exports = new TelegramBotService();
