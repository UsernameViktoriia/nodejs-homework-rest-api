const { User } = require("../models/userModel");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp");

const avatarsDir = path.resolve("./src/public/avatars");

const updateAvatar = async (req, res) => {
  try {
    const { _id: id } = req.user;
    const { filename, path: tempPath } = req.file;
    const extension = filename.split(".").reverse()[0];
    const nameId = `${id}.${extension}`;
    const newDir = path.join(avatarsDir, nameId);
    const file = await Jimp.read(tempPath);
    await file.resize(250, Jimp.AUTO);
    await file.writeAsync(tempPath);
    await fs.rename(tempPath, newDir);
    const avatarURL = path.join("avatars", nameId);
    const result = await User.findByIdAndUpdate(
      req.user._id,
      { avatarURL },
      { new: true }
    );
    res.status(201).json({ avatarURL: result.avatarURL });
  } catch (error) {
    if (error.message.includes("no such file or directory")) {
      await fs.unlink(req.file.path);
    }
    throw error;
  }
};

module.exports = { updateAvatar };
