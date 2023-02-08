const { User } = require("../models/userModel");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp");

const avatarsDir = path.resolve("./src/public/avatars");

const updateAvatar = async (req, res) => {
  const { path: tempUpload, originalname } = req.file;
  const { _id: id } = req.user;
  const imageName = `${id}_${originalname}`;
  try {
    const resultUpload = path.join(avatarsDir, imageName);
    await Jimp.read(tempUpload, (err, image) => {
      if (err) throw err;
      image.resize(250, 250).write(resultUpload);
      console.log(resultUpload);
    });

    await fs.rename(tempUpload, resultUpload);
    const avatarUrl = path.join("avatars", imageName);
    console.log(avatarUrl);
    await User.findByIdAndUpdate(req.user._id, { avatarUrl });
    res.json(avatarUrl);
  } catch (error) {
    await fs.unlink(tempUpload);
    throw error;
  }
};

module.exports = updateAvatar;
