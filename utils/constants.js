module.exports = {
  COMPANY_INFO: {
    name: "Jasur shop",
    phone: "+998 55 500 55 52",
    deliveryAreas: ["Bukhara region", "Tashkent city"],
  },

  ORDER_STATUS: {
    PENDING: "pending",
    PROCESSING: "processing",
    CONFIRMED: "confirmed",
    SHIPPED: "shipped",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
  },

  PAYMENT_METHODS: {
    CASH: "cash",
    CARD: "card",
    ONLINE: "online",
  },

  USER_STATES: {
    IDLE: "idle",
    AWAITING_NAME: "awaiting_name",
    AWAITING_PHONE: "awaiting_phone",
    AWAITING_ADDRESS: "awaiting_address",
    SEARCHING: "searching",
    ADDING_TO_CART: "adding_to_cart",
  },
};
