const Notification = require('../models/Notification');
const User = require('../models/User');
const sendEmail = require('./sendEmail');

/**
 * Creates an in-app notification and optionally emails the recipient.
 * Never throws — notification failures should not break the primary action
 * (e.g. accepting a quote should succeed even if the email provider is down).
 */
const notify = async ({ recipientId, type, title, message, link = '', relatedId = null, email = true }) => {
  try {
    await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      link,
      relatedId,
    });

    if (email) {
      const user = await User.findById(recipientId).select('email name');
      if (user?.email) {
        await sendEmail({
          to: user.email,
          subject: title,
          html: `<p>Hi ${user.name || ''},</p><p>${message}</p><p>— LocalFix</p>`,
          text: message,
        });
      }
    }
  } catch (error) {
    console.error('[LocalFix][notify] Failed to send notification:', error.message);
  }
};

module.exports = notify;
