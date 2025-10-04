const express = require("express");
const Product = require("../models/Product");
const router = express.Router();

// CREATE - POST /api/products
router.post("/", async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

// READ ALL - GET /api/products (with pagination and search)
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build search query
    let searchQuery = {};

    // Text search across name, description, and category
    if (req.query.search) {
      searchQuery.$text = { $search: req.query.search };
    }

    // Individual field searches
    if (req.query.name) {
      searchQuery.name = { $regex: req.query.name, $options: "i" };
    }
    if (req.query.category) {
      searchQuery.category = { $regex: req.query.category, $options: "i" };
    }
    if (req.query.description) {
      searchQuery.description = {
        $regex: req.query.description,
        $options: "i",
      };
    }

    // Filter by stock status
    if (req.query.inStock !== undefined) {
      searchQuery.inStock = req.query.inStock === "true";
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      searchQuery.price = {};
      if (req.query.minPrice)
        searchQuery.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice)
        searchQuery.price.$lte = parseFloat(req.query.maxPrice);
    }

    const total = await Product.countDocuments(searchQuery);
    const products = await Product.find(searchQuery)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: products,
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

// READ ONE - GET /api/products/:id
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    res.json({
      success: true,
      data: product,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// UPDATE - PUT /api/products/:id
router.put("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    res.json({
      success: true,
      data: product,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

// DELETE - DELETE /api/products/:id
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    res.json({
      success: true,
      message: "Product deleted successfully",
      data: product,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
