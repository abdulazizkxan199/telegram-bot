const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      name: String,
      price: Number,
      quantity: {
        type: Number,
        default: 1,
        min: 1,
      },
    },
  ],
  totalAmount: {
    type: Number,
    default: 0,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

cartSchema.methods.calculateTotal = function () {
  this.totalAmount = this.items.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);
  return this.totalAmount;
};

module.exports = mongoose.model("Cart", cartSchema);
