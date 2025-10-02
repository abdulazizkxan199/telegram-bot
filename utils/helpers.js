const formatPrice = (price) => {
  return new Intl.NumberFormat("uz-UZ").format(price) + " UZS";
};

const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const formatOrderDetails = (order) => {
  let productsList = "";
  order.products.forEach((item, index) => {
    productsList += `${index + 1} x ${item.name} (${
      item.category
    }) – ${formatPrice(item.price * item.quantity)}\n`;
  });

  return `<b>📦 Order: #${order.orderId}</b>
<b>💳 Payment Method:</b> ${order.paymentMethod || "Not specified"}
<b>📅 Order Date:</b> ${formatDate(order.createdAt)}
<b>📊 Status:</b> ${order.status}
<b>💰 Total:</b> ${formatPrice(order.totalAmount)}

<b>🛍️ Order Details:</b>
${productsList}
<b>👤 Customer Info:</b>
<b>Name:</b> ${order.customerName || "Not provided"}
<b>Phone:</b> ${order.customerPhone || "Not provided"}
<b>Address:</b> ${order.customerAddress}
<b>Email:</b> ${order.customerEmail}`;
};

module.exports = {
  formatPrice,
  formatDate,
  formatOrderDetails,
};
