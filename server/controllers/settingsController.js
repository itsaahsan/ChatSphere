const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const getSettings = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      'theme notifications privacy'
    );

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    res.json({
      theme: user.theme,
      notifications: user.notifications,
      privacy: user.privacy,
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const updateTheme = asyncHandler(async (req, res) => {
  const { theme } = req.body;

  if (!['light', 'dark', 'auto'].includes(theme)) {
    res.status(400);
    throw new Error('Invalid theme value. Must be: light, dark, or auto');
  }

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.theme = theme;
    await user.save();

    res.json({
      message: 'Theme updated successfully',
      theme: user.theme,
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const updateNotificationSettings = asyncHandler(async (req, res) => {
  const { sound, desktop } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (sound !== undefined) {
      user.notifications.sound = sound;
    }

    if (desktop !== undefined) {
      user.notifications.desktop = desktop;
    }

    await user.save();

    res.json({
      message: 'Notification settings updated successfully',
      notifications: user.notifications,
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const updatePrivacySettings = asyncHandler(async (req, res) => {
  const { lastSeen, profilePic, about } = req.body;

  const validValues = ['everyone', 'contacts', 'nobody'];

  if (lastSeen && !validValues.includes(lastSeen)) {
    res.status(400);
    throw new Error('Invalid lastSeen value');
  }

  if (profilePic && !validValues.includes(profilePic)) {
    res.status(400);
    throw new Error('Invalid profilePic value');
  }

  if (about && !validValues.includes(about)) {
    res.status(400);
    throw new Error('Invalid about value');
  }

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (lastSeen) {
      user.privacy.lastSeen = lastSeen;
    }

    if (profilePic) {
      user.privacy.profilePic = profilePic;
    }

    if (about) {
      user.privacy.about = about;
    }

    await user.save();

    res.json({
      message: 'Privacy settings updated successfully',
      privacy: user.privacy,
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const updateAllSettings = asyncHandler(async (req, res) => {
  const { theme, notifications, privacy } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (theme && ['light', 'dark', 'auto'].includes(theme)) {
      user.theme = theme;
    }

    if (notifications) {
      if (notifications.sound !== undefined) {
        user.notifications.sound = notifications.sound;
      }
      if (notifications.desktop !== undefined) {
        user.notifications.desktop = notifications.desktop;
      }
    }

    if (privacy) {
      const validValues = ['everyone', 'contacts', 'nobody'];

      if (privacy.lastSeen && validValues.includes(privacy.lastSeen)) {
        user.privacy.lastSeen = privacy.lastSeen;
      }
      if (privacy.profilePic && validValues.includes(privacy.profilePic)) {
        user.privacy.profilePic = privacy.profilePic;
      }
      if (privacy.about && validValues.includes(privacy.about)) {
        user.privacy.about = privacy.about;
      }
    }

    await user.save();

    res.json({
      message: 'Settings updated successfully',
      settings: {
        theme: user.theme,
        notifications: user.notifications,
        privacy: user.privacy,
      },
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const resetSettings = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.theme = 'light';
    user.notifications = {
      sound: true,
      desktop: true,
    };
    user.privacy = {
      lastSeen: 'everyone',
      profilePic: 'everyone',
      about: 'everyone',
    };

    await user.save();

    res.json({
      message: 'Settings reset to defaults',
      settings: {
        theme: user.theme,
        notifications: user.notifications,
        privacy: user.privacy,
      },
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = {
  getSettings,
  updateTheme,
  updateNotificationSettings,
  updatePrivacySettings,
  updateAllSettings,
  resetSettings,
};
