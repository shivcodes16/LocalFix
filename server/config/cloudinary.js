const cloudinary = require('cloudinary').v2;

const isConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.warn(
    '[LocalFix] Cloudinary credentials not set. Image uploads will fall back to ' +
      'storing the raw URL/base64 payload sent by the client instead of uploading to Cloudinary.'
  );
}

module.exports = { cloudinary, isCloudinaryConfigured: isConfigured };
