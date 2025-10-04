const express = require("express");
const User = require("../models/User");
const Product = require("../models/Product");
const Orders = require("../models/Orders");

const router = express.Router();

router.use("/users", require("./user"));
router.use("/products", require("./product"));
router.use("/orders", require("./order"));

router.get("/stats", async (_, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const totalProducts = await Product.countDocuments();

    const totalOrders = await Orders.countDocuments();

    const revenueResult = await Orders.aggregate([
      { $group: { _id: null, revenue: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = revenueResult[0]?.revenue || 0;

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
