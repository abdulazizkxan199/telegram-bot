const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  nameUz: String,
  category: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: String,
  descriptionUz: String,
  imageUrl: String,
  inStock: {
    type: Boolean,
    default: true,
  },
  weight: String,
  unit: {
    type: String,
    default: "kg",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

productSchema.index({ name: "text", description: "text", category: "text" });

module.exports = mongoose.model("Product", productSchema);
