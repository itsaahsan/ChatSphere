const webpush = require('web-push');

const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
};

webpush.setVapidDetails(
  'mailto:' + (process.env.VAPID_EMAIL || 'admin@chatsphere.com'),
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

const sendPushNotification = async (subscription, payload) => {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
};

module.exports = {
  sendPushNotification,
};
