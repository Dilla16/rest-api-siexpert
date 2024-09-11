// controllers/imageController.js
const cloudinary = require("cloudinary").v2;
const Image = require("../models/Image");

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Fungsi untuk mengupload gambar ke Cloudinary dan menyimpan detail ke database
exports.uploadImage = async (req, res) => {
  try {
    // Mengunggah gambar ke Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);

    // Membuat instance dari model Image
    const newImage = new Image({
      url: result.secure_url,
      public_id: result.public_id,
      caption: req.body.caption,
    });

    // Menyimpan data gambar ke MongoDB
    await newImage.save();

    res.status(201).json({
      success: true,
      data: newImage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to upload image",
    });
  }
};

// Fungsi untuk menghapus gambar dari Cloudinary dan database
exports.deleteImage = async (req, res) => {
  try {
    const { id } = req.params;

    // Mencari gambar di database
    const image = await Image.findById(id);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    // Menghapus gambar dari Cloudinary
    await cloudinary.uploader.destroy(image.public_id);

    // Menghapus data gambar dari database
    await image.remove();

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to delete image",
    });
  }
};
