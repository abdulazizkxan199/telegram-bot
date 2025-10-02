const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  telegramId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  username: String,
  firstName: String,
  lastName: String,
  phone: String,
  address: String,
  email: String,
  language: {
    type: String,
    default: "uz",
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
