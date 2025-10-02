# 🥩 Biftek Telegram E-commerce Bot

Professional Telegram bot for online meat store with shopping cart, order management, and admin panel.

## 📋 Features

- 🛒 **Shopping Cart System** - Add, update, remove products
- 📦 **Order Management** - Create and track orders
- 👤 **User Profiles** - Manage personal information
- 🔍 **Product Search** - Find products by name or category
- 💳 **Multiple Payment Options** - Cash, Card, Online
- 📱 **Contact Sharing** - Easy phone number registration
- 🌐 **Multi-language Support** - Uzbek and English (extensible)
- 👨‍💼 **Admin Panel** - Product and order management (coming soon)

## 🏗️ Project Structure

```
telegram-ecommerce-bot/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── userController.js    # User CRUD operations
│   ├── productController.js # Product management
│   ├── orderController.js   # Order processing
│   └── cartController.js    # Shopping cart logic
├── models/
│   ├── User.js             # User schema
│   ├── Product.js          # Product schema
│   ├── Category.js         # Category schema
│   ├── Order.js            # Order schema
│   └── Cart.js             # Cart schema
├── services/
│   ├── telegramBot.js      # Main bot logic
│   ├── paymentService.js   # Payment processing
│   └── notificationService.js # User notifications
├── middleware/
│   ├── auth.js             # Authentication
│   └── validation.js       # Input validation
├── utils/
│   ├── helpers.js          # Helper functions
│   ├── constants.js        # Constants and enums
│   └── seedProducts.js     # Database seeder
├── keyboards/
│   ├── mainKeyboard.js     # Main menu keyboards
│   ├── productKeyboard.js  # Product keyboards
│   └── adminKeyboard.js    # Admin keyboards
├── locales/
│   └── uz.json             # Uzbek translations
├── .env                    # Environment variables
├── .gitignore
├── package.json
└── app.js                  # Entry point
```

## 🚀 Installation

### Prerequisites

- Node.js >= 14.x
- MongoDB >= 4.x
- Telegram Bot Token (from @BotFather)

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/telegram-ecommerce-bot.git
cd telegram-ecommerce-bot
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment

Create `.env` file:

```env
BOT_TOKEN=your_telegram_bot_token_here
MONGODB_URI=mongodb://localhost:27017/biftek_bot
PORT=3000
NODE_ENV=development
```

### Step 4: Seed Database

```bash
npm run seed
```

### Step 5: Start Bot

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

## 📱 Bot Commands

- `/start` - Start bot and show main menu
- `/help` - Show help information
- `/admin` - Access admin panel (admin only)

## 🎯 Main Menu Options

1. **🥩 Products** - Browse meat catalog

   - All Products
   - Meat Products
   - Beef
   - Lamb

2. **🛒 Cart** - View and manage shopping cart

   - Add/Remove items
   - Update quantities
   - Checkout

3. **📦 Place Order** - Create new order

   - Enter customer details
   - Confirm order

4. **👤 Personal Cabinet**

   - My Orders
   - Phone Number
   - Address

5. **🔍 Search** - Search products by keyword

## 🗄️ Database Schemas

### User

```javascript
{
  telegramId: String (unique),
  username: String,
  firstName: String,
  lastName: String,
  phone: String,
  address: String,
  email: String,
  language: String (default: 'uz'),
  isAdmin: Boolean (default: false)
}
```

### Product

```javascript
{
  name: String,
  nameUz: String,
  category: String,
  price: Number,
  description: String,
  descriptionUz: String,
  imageUrl: String,
  inStock: Boolean,
  weight: String,
  unit: String
}
```

### Order

```javascript
{
  orderId: Number (unique),
  userId: String,
  products: Array,
  totalAmount: Number,
  status: Enum,
  paymentMethod: String,
  customerName: String,
  customerPhone: String,
  customerAddress: String
}
```

### Cart

```javascript
{
  userId: String (unique),
  items: Array,
  totalAmount: Number,
  updatedAt: Date
}
```

## 🔧 Configuration

### Adding New Products

```bash
# Edit utils/seedProducts.js and run:
npm run seed
```

### Setting Admin Users

```javascript
// In MongoDB, update user:
db.users.updateOne(
  { telegramId: "YOUR_TELEGRAM_ID" },
  { $set: { isAdmin: true } }
);
```

## 📦 Dependencies

```json
{
  "node-telegram-bot-api": "^0.64.0",
  "mongoose": "^8.0.0",
  "dotenv": "^16.3.1"
}
```

## 🛠️ Development

### Run with Nodemon

```bash
npm run dev
```

### Add New Features

1. Create controller in `controllers/`
2. Add model in `models/`
3. Update bot service in `services/telegramBot.js`
4. Add keyboard layout in `keyboards/`

## 📝 Environment Variables

| Variable      | Description               | Example                            |
| ------------- | ------------------------- | ---------------------------------- |
| `BOT_TOKEN`   | Telegram bot token        | `123456:ABC-DEF...`                |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/biftek` |
| `PORT`        | Server port               | `3000`                             |
| `NODE_ENV`    | Environment               | `development` / `production`       |

## 🔐 Security

- Never commit `.env` file
- Use environment variables for sensitive data
- Validate all user inputs
- Implement rate limiting for production
- Use HTTPS for webhook mode (optional)

## 🚀 Deployment

### Using PM2

```bash
npm install -g pm2
pm2 start app.js --name biftek-bot
pm2 save
pm2 startup
```

### Using Docker

```dockerfile
FROM node:14
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the ISC License.

## 📞 Support

- 📧 Email: support@biftek.uz
- 📱 Phone: +998 55 500 55 52
- 🌐 Website: www.biftek.uz

## 🙏 Acknowledgments

- Telegram Bot API
- Node.js Community
- MongoDB

---

Made with ❤️ by Biftek Team
