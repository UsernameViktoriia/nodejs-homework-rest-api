const multer = require("multer");

const multerConfig = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, "src/tmp");
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

const uploadAvatar = multer({
  storage: multerConfig,
});

module.exports = uploadAvatar;
