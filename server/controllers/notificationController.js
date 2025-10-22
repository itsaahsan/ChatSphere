const asyncHandler = require('express-async-handler');
const webpush = require('web-push');
const User = require('../models/User');
const Notification = require('../models/Notification');

const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY || webpush.generateVAPIDKeys().publicKey,
  privateKey: process.env.VAPID_PRIVATE_KEY || webpush.generateVAPIDKeys().privateKey,
};

webpush.setVapidDetails(
  'mailto:' + (process.env.ADMIN_EMAIL || 'admin@chatsphere.com'),
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

const getVapidPublicKey = asyncHandler(async (req, res) => {
  res.json({ publicKey: vapidKeys.publicKey });
});

const subscribe = asyncHandler(async (req, res) => {
  const { subscription } = req.body;
  const userId = req.user._id;

  if (!subscription || !subscription.endpoint) {
    res.status(400);
    throw new Error('Invalid subscription');
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      pushSubscription: {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      },
    },
    { new: true }
  );

  res.status(201).json({ message: 'Subscription saved successfully' });
});

const unsubscribe = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await User.findByIdAndUpdate(userId, {
    $unset: { pushSubscription: 1 },
  });

  res.json({ message: 'Unsubscribed successfully' });
});

const sendPushNotification = async (userId, payload) => {
  try {
    const user = await User.findById(userId);

    if (!user || !user.pushSubscription || !user.pushSubscription.endpoint) {
      return;
    }

    if (!user.notifications.desktop) {
      return;
    }

    const subscription = {
      endpoint: user.pushSubscription.endpoint,
      keys: {
        p256dh: user.pushSubscription.keys.p256dh,
        auth: user.pushSubscription.keys.auth,
      },
    };

    await webpush.sendNotification(subscription, JSON.stringify(payload));
  } catch (error) {
    console.error('Error sending push notification:', error);
    if (error.statusCode === 410) {
      await User.findByIdAndUpdate(userId, {
        $unset: { pushSubscription: 1 },
      });
    }
  }
};

const getNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  try {
    const notifications = await Notification.find({ user: req.user._id })
      .populate('sender', 'name pic')
      .populate('chat', 'chatName isGroupChat')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments({ user: req.user._id });
    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    res.json({
      notifications,
      total,
      unreadCount,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const markNotificationAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  try {
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      res.status(404);
      throw new Error('Notification not found');
    }

    if (notification.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized');
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.json(notification);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const deleteNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  try {
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      res.status(404);
      throw new Error('Notification not found');
    }

    if (notification.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized');
    }

    await notification.deleteOne();
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const createNotification = async (userId, type, data) => {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      ...data,
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

module.exports = {
  getVapidPublicKey,
  subscribe,
  unsubscribe,
  sendPushNotification,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  createNotification,
};
