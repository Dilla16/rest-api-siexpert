// imageController.js
const uploadImage = require("../models/imageModels");

const imageConttroller = {
  async uploadImage(req, res) {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      const folderName = "your_folder_name"; // Nama folder di Cloudinary, jika diperlukan
      const result = await uploadImage(req.file.buffer, folderName);
      res.status(200).json({ url: result.secure_url });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = imageConttroller;
