const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

/**
 * Uploads a single image buffer. Returns a usable URL either way:
 * - If Cloudinary is configured, uploads there and returns the secure_url.
 * - Otherwise, falls back to a base64 data URI so the app keeps working
 *   end-to-end without external credentials (fine for local dev/demo;
 *   not recommended for production without Cloudinary configured).
 */
const uploadImageBuffer = (buffer, mimetype, folder = 'localfix') => {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured) {
      const base64 = buffer.toString('base64');
      resolve(`data:${mimetype};base64,${base64}`);
      return;
    }

    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) return reject(error);
      resolve(result.secure_url);
    });
    stream.end(buffer);
  });
};

const uploadMultipleImages = async (files = [], folder = 'localfix') => {
  const uploads = files.map((file) => uploadImageBuffer(file.buffer, file.mimetype, folder));
  return Promise.all(uploads);
};

module.exports = { uploadImageBuffer, uploadMultipleImages };
