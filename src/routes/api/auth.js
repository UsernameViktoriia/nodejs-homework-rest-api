const express = require("express");
const auth = require("../../middleware/authMiddleware");
const uploadAvatar = require("../../middleware/avatarMiddleware");
const { ctrlWrapper } = require("../../helpers/ctrlWrapper");
const {
  signup,
  login,
  logout,
  getCurrent,
  updateSubscription,
} = require("../../controllers/authController");
const { updateAvatar } = require("../../controllers/avatarController");

const router = express.Router();

router.post("/signup", ctrlWrapper(signup));
router.post("/login", ctrlWrapper(login));
router.get("/logout", auth, ctrlWrapper(logout));
router.get("/current", auth, ctrlWrapper(getCurrent));
router.patch(
  "/avatars",
  auth,
  uploadAvatar.single("avatar"),
  ctrlWrapper(updateAvatar)
);
router.patch("/", auth, updateSubscription);

module.exports = router;
