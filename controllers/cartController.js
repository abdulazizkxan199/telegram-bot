const Cart = require("../models/Cart");
const Product = require("../models/Product");

class CartController {
  async getCart(userId) {
    let cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart) {
      cart = new Cart({ userId, items: [] });
      await cart.save();
    }
    return cart;
  }

  async addToCart(userId, productId, quantity = 1) {
    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity,
      });
    }

    cart.calculateTotal();
    cart.updatedAt = Date.now();
    await cart.save();
    return cart;
  }

  async updateQuantity(userId, productId, quantity) {
    const cart = await Cart.findOne({ userId });
    if (!cart) throw new Error("Cart not found");

    const item = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (item) {
      if (quantity <= 0) {
        cart.items = cart.items.filter(
          (item) => item.productId.toString() !== productId
        );
      } else {
        item.quantity = quantity;
      }
      cart.calculateTotal();
      cart.updatedAt = Date.now();
      await cart.save();
    }

    return cart;
  }

  async removeFromCart(userId, productId) {
    const cart = await Cart.findOne({ userId });
    if (!cart) throw new Error("Cart not found");

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );
    cart.calculateTotal();
    cart.updatedAt = Date.now();
    await cart.save();
    return cart;
  }

  async clearCart(userId) {
    const cart = await Cart.findOne({ userId });
    if (cart) {
      cart.items = [];
      cart.totalAmount = 0;
      cart.updatedAt = Date.now();
      await cart.save();
    }
    return cart;
  }
}

module.exports = new CartController();
