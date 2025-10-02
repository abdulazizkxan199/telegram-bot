const validatePhone = (phone) => {
  const phoneRegex = /^\+?998\d{9}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ""));
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const sanitizeInput = (input) => {
  return input.trim().replace(/[<>]/g, "");
};

module.exports = {
  validatePhone,
  validateEmail,
  sanitizeInput,
};
