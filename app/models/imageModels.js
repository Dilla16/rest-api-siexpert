// imageModel.js
const cloudinary = require("../../config/cloudinaryConfig");

const imageModels = {
  async uploadImage(imageBuffer, folderName = "") {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: folderName }, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        })
        .end(imageBuffer);
    });
  },
};

module.exports = imageModels;
