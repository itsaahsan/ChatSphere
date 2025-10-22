const crypto = require('crypto');

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const isOTPExpired = (otpExpiry) => {
  return new Date() > new Date(otpExpiry);
};

const getOTPExpiryTime = () => {
  return new Date(Date.now() + 10 * 60 * 1000);
};

const getVerificationTokenExpiry = () => {
  return new Date(Date.now() + 24 * 60 * 60 * 1000);
};

module.exports = {
  generateOTP,
  generateVerificationToken,
  isOTPExpired,
  getOTPExpiryTime,
  getVerificationTokenExpiry,
};
