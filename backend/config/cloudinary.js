const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudinary = require('../config/cloudinary');


/*const photos = [];

for (let i = 0; i < files.length; i++) {
  const file = files[i];
  const label = req.body[`photoLabel${i}`] || ""; // You can send labels from frontend
  const uploadResult = await cloudinary.uploader.upload(file.path);

  photos.push({
    url: uploadResult.secure_url,
    label: label
  });
}*/





/*const uploadBase64Image = async (base64Image) => {
  try {
    // ✅ Make sure you're passing a string, not an object
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: "your_folder_name", // Optional
    });
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

module.exports = uploadBase64Image;*/


module.exports = cloudinary;