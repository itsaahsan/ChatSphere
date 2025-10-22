const CryptoJS = require('crypto-js');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';

const encryptMessage = (message) => {
  try {
    return CryptoJS.AES.encrypt(message, ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt message');
  }
};

const decryptMessage = (encryptedMessage) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt message');
  }
};

module.exports = {
  encryptMessage,
  decryptMessage,
};
