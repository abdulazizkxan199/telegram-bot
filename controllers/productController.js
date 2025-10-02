const Product = require("../models/Product");

class ProductController {
  async getAllProducts() {
    return await Product.find({ inStock: true });
  }

  async getProductsByCategory(category) {
    return await Product.find({ category, inStock: true });
  }

  async getProductById(productId) {
    return await Product.findById(productId);
  }

  async searchProducts(query) {
    return await Product.find({
      $text: { $search: query },
      inStock: true,
    });
  }

  async createProduct(productData) {
    const product = new Product(productData);
    return await product.save();
  }

  async updateProduct(productId, updateData) {
    return await Product.findByIdAndUpdate(productId, updateData, {
      new: true,
    });
  }

  async deleteProduct(productId) {
    return await Product.findByIdAndDelete(productId);
  }
}

module.exports = new ProductController();
