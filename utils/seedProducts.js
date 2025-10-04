// require("dotenv").config();
// const connectDB = require("../config/database");
// const Product = require("../models/Product");

// const products = [
//   {
//     name: "Boneless Beef",
//     category: "Beef",
//     price: 97990,
//     description:
//       "Premium quality boneless beef, fresh and tender. Perfect for steaks and grilling.",
//     imageUrl:
//       "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=800",
//     inStock: true,
//   },
//   {
//     name: "Beef Ribs",
//     category: "Beef",
//     price: 85000,
//     description: "Delicious beef ribs, ideal for BBQ and slow cooking.",
//     imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800",
//     inStock: true,
//   },
//   {
//     name: "Ground Beef",
//     category: "Beef",
//     price: 65000,
//     description: "Freshly ground beef, perfect for burgers and meatballs.",
//     imageUrl:
//       "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=800",
//     inStock: true,
//   },
//   {
//     name: "Lamb Chops",
//     category: "Lamb",
//     price: 125000,
//     description: "Premium lamb chops, tender and flavorful.",
//     imageUrl:
//       "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800",
//     inStock: true,
//   },
//   {
//     name: "Lamb Leg",
//     category: "Lamb",
//     price: 110000,
//     description: "Whole lamb leg, perfect for roasting.",
//     imageUrl:
//       "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=800",
//     inStock: true,
//   },
//   {
//     name: "Beef Sausages",
//     category: "Meat Products",
//     price: 45000,
//     description: "Homemade beef sausages with special spices.",
//     imageUrl:
//       "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800",
//     weight: "500",
//     unit: "g",
//     inStock: true,
//   },
//   {
//     name: "Beef Steak",
//     category: "Beef",
//     price: 115000,
//     description: "Premium beef steak cuts, perfect for grilling.",
//     imageUrl: "https://images.unsplash.com/photo-1558030006-450675393462?w=800",
//     inStock: true,
//   },
//   {
//     name: "Lamb Kebab Meat",
//     category: "Lamb",
//     price: 95000,
//     description: "Fresh lamb meat prepared for kebabs.",
//     imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800",
//     inStock: true,
//   },
// ];

// async function seedProducts() {
//   try {
//     await connectDB();
//     console.log("Connected to MongoDB");

//     // Clear existing products
//     await Product.deleteMany({});
//     console.log("Cleared existing products");

//     // Insert new products
//     await Product.insertMany(products);
//     console.log(`✅ Successfully seeded ${products.length} products`);

//     process.exit(0);
//   } catch (error) {
//     console.error("❌ Error seeding products:", error);
//     process.exit(1);
//   }
// }

// seedProducts();

const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const Product = require("./models/Product");

// 🔹 MongoDB ulanishi
mongoose
  .connect("mongodb://127.0.0.1:27017/telegrambot", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// 🔹 Cloudinary sozlamalari
cloudinary.config({
  cloud_name: "dtvgr346a",
  api_key: "691791347822223",
  api_secret: "8NEMlf5OhLxMVJA74Vm8ClDp92k",
});

// 🔹 Rasmlar papkasi
const imagesDir = path.join(__dirname, "images");

async function uploadAndSave() {
  try {
    const categories = fs.readdirSync(imagesDir);

    for (const category of categories) {
      const categoryPath = path.join(imagesDir, category);

      if (fs.lstatSync(categoryPath).isDirectory()) {
        console.log(`📂 Processing category: ${category}`);

        const files = fs.readdirSync(categoryPath);

        for (const file of files) {
          const filePath = path.join(categoryPath, file);

          if (fs.lstatSync(filePath).isFile()) {
            console.log(`📤 Uploading ${file} in ${category} ...`);

            // 🔹 Cloudinary ga yuklash
            const result = await cloudinary.uploader.upload(filePath, {
              folder: `telegram-bot-products/${category}`, // har bir category uchun alohida folder
            });

            // 🔹 Product yaratish
            const product = new Product({
              name: path.parse(file).name || "No name product",
              category: category,
              price: Math.floor(Math.random() * 100000) + 10000, // random narx
              description: `Auto generated product in category: ${category}`,
              imageUrl: result.secure_url,
              inStock: true,
            });

            await product.save();
            console.log(`✅ Saved product: ${product.name} in ${category}`);
          }
        }
      }
    }

    console.log("🎉 All products uploaded and saved to DB!");
    mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error);
    mongoose.disconnect();
  }
}

uploadAndSave();
