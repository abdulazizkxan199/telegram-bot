const express = require("express");
const Orders = require("../models/Orders");
const router = express.Router();

// CREATE - POST /api/orders
router.post("/", async (req, res) => {
  try {
    const order = new Orders(req.body);
    await order.save();

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Order with this ID already exists",
      });
    }
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

// READ ALL - GET /api/orders
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter query
    let filterQuery = {};

    // Filter by status
    if (req.query.status) {
      filterQuery.status = req.query.status;
    }

    // Filter by payment method
    if (req.query.paymentMethod) {
      filterQuery.paymentMethod = req.query.paymentMethod;
    }

    // Filter by userId (Telegram ID)
    if (req.query.userId) {
      filterQuery.userId = req.query.userId;
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filterQuery.createdAt = {};
      if (req.query.startDate)
        filterQuery.createdAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate)
        filterQuery.createdAt.$lte = new Date(req.query.endDate);
    }

    const total = await Orders.countDocuments();
    const orders = await Orders.find().skip(skip).limit(limit).sort({});

    res.json({
      success: true,
      data: orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// READ ONE - GET /api/orders/:id (with populate)
router.get("/:id", async (req, res) => {
  try {
    const order = await Orders.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// UPDATE - PUT /api/orders/:id
router.put("/:id", async (req, res) => {
  try {
    const order = await Orders.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

// DELETE - DELETE /api/orders/:id
router.delete("/:id", async (req, res) => {
  try {
    const order = await Orders.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    res.json({
      success: true,
      message: "Order deleted successfully",
      data: order,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
