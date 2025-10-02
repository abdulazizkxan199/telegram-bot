require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");

const products = [
  {
    name: "Boneless Beef",
    nameUz: "Suyaksiz mol go'shti",
    category: "Beef",
    price: 97990,
    description:
      "Premium quality boneless beef, fresh and tender. Perfect for steaks and grilling.",
    descriptionUz:
      "Yuqori sifatli suyaksiz mol go'shti, yangi va yumshoq. Bifshteks va panjara uchun ideal.",
    imageUrl:
      "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=800",
    weight: "1",
    unit: "kg",
    inStock: true,
  },
  {
    name: "Beef Ribs",
    nameUz: "Mol qovurg'asi",
    category: "Beef",
    price: 85000,
    description: "Delicious beef ribs, ideal for BBQ and slow cooking.",
    descriptionUz: "Mazali mol qovurg'asi, BBQ va sekin pishirish uchun ideal.",
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800",
    weight: "1",
    unit: "kg",
    inStock: true,
  },
  {
    name: "Ground Beef",
    nameUz: "Qiyma",
    category: "Beef",
    price: 65000,
    description: "Freshly ground beef, perfect for burgers and meatballs.",
    descriptionUz:
      "Yangi maydalangan mol go'shti, burger va kotlet uchun ideal.",
    imageUrl:
      "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=800",
    weight: "1",
    unit: "kg",
    inStock: true,
  },
  {
    name: "Lamb Chops",
    nameUz: "Qo'y pirzolasi",
    category: "Lamb",
    price: 125000,
    description: "Premium lamb chops, tender and flavorful.",
    descriptionUz: "Premium qo'y pirzolasi, yumshoq va mazali.",
    imageUrl:
      "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800",
    weight: "1",
    unit: "kg",
    inStock: true,
  },
  {
    name: "Lamb Leg",
    nameUz: "Qo'y oyog'i",
    category: "Lamb",
    price: 110000,
    description: "Whole lamb leg, perfect for roasting.",
    descriptionUz: "To'liq qo'y oyog'i, qovurish uchun ideal.",
    imageUrl:
      "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=800",
    weight: "1",
    unit: "kg",
    inStock: true,
  },
  {
    name: "Beef Sausages",
    nameUz: "Mol go'shti kolbasa",
    category: "Meat Products",
    price: 45000,
    description: "Homemade beef sausages with special spices.",
    descriptionUz:
      "Maxsus ziravorlar bilan uy sharoitida tayyorlangan mol go'shti kolbasasi.",
    imageUrl:
      "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800",
    weight: "500",
    unit: "g",
    inStock: true,
  },
  {
    name: "Beef Steak",
    nameUz: "Bifshteks",
    category: "Beef",
    price: 115000,
    description: "Premium beef steak cuts, perfect for grilling.",
    descriptionUz: "Premium bifshteks, panjara qilish uchun ideal.",
    imageUrl: "https://images.unsplash.com/photo-1558030006-450675393462?w=800",
    weight: "1",
    unit: "kg",
    inStock: true,
  },
  {
    name: "Lamb Kebab Meat",
    nameUz: "Qo'y kabob go'shti",
    category: "Lamb",
    price: 95000,
    description: "Fresh lamb meat prepared for kebabs.",
    descriptionUz: "Kabob uchun tayyorlangan yangi qo'y go'shti.",
    imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800",
    weight: "1",
    unit: "kg",
    inStock: true,
  },
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing products
    await Product.deleteMany({});
    console.log("Cleared existing products");

    // Insert new products
    await Product.insertMany(products);
    console.log(`✅ Successfully seeded ${products.length} products`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding products:", error);
    process.exit(1);
  }
}

seedProducts();
