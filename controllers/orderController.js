const Orders = require("../models/Orders");

class OrderController {
  async getNextOrderId() {
    const lastOrder = await Orders.findOne().sort({ orderId: -1 });
    return lastOrder ? lastOrder.orderId + 1 : 1;
  }

  async createOrder(orderData) {
    const orderId = await this.getNextOrderId();
    const order = new Orders({
      ...orderData,
      orderId,
    });
    await order.save();
    return order;
  }

  async createOrderFromProduct(userId, productId, productData, customerInfo) {
    const orderId = await this.getNextOrderId();

    const order = new Orders({
      orderId,
      userId,
      products: [
        {
          productId,
          name: productData.name,
          category: productData.category,
          price: productData.price,
          quantity: 1,
        },
      ],
      totalAmount: productData.price,
      status: "processing",
      ...customerInfo,
    });

    await order.save();
    return order;
  }

  async createOrderFromCart(userId, cart, customerInfo) {
    const orderId = await this.getNextOrderId();

    const order = new Orders({
      orderId,
      userId,
      products: cart.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        category: item.category || "Unknown",
        price: item.price,
        quantity: item.quantity,
      })),
      totalAmount: cart.totalAmount,
      status: "processing",
      ...customerInfo,
    });

    await order.save();

    // Clear cart after order creation
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    return order;
  }

  async getOrderById(orderId) {
    return await Orders.findOne({ orderId });
  }

  async getUserOrders(userId, limit = 10) {
    return await Orders.find({ userId }).sort({ createdAt: -1 }).limit(limit);
  }

  async updateOrderStatus(orderId, status) {
    return await Orders.findOneAndUpdate(
      { orderId },
      { status, updatedAt: Date.now() },
      { new: true }
    );
  }

  async getAllOrders(filter = {}, limit = 50) {
    return await Order.find(filter).sort({ createdAt: -1 }).limit(limit);
  }
}

module.exports = new OrderController();
