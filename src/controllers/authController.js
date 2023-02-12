const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const gravatar = require("gravatar");
const {
  User,
  joiRegisterSchema,
  joiLoginSchema,
  joiSubscriptionSchema,
  joiEmailSchema,
} = require("../models/userModel");
const createError = require("../helpers/createError");
const sendMail = require("../helpers/sendMail");

const { SECRET_KEY } = process.env;

const signup = async (req, res) => {
  const { error } = joiRegisterSchema.validate(req.body);
  if (error) {
    throw createError(400, "Please, all fields are required");
  }
  const { name, email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw createError(409, "Email in use");
  }
  const avatarUrl = gravatar.url(email);
  const verificationToken = uuidv4();
  const newUser = new User({ name, email, avatarUrl, verificationToken });
  newUser.setPassword(password);
  newUser.save();
  const mail = {
    to: email,
    subject: "Confirm email",
    html: `<a target="_blank" href="http://localhost:3000/api/users/verify/${verificationToken}">Confirm</a>`,
  };
  await sendMail(mail);
  res.status(201).json({
    user: {
      email,
      subscription: newUser.subscription,
      avatarUrl,
    },
  });
};

const login = async (req, res) => {
  const { error } = joiLoginSchema.validate(req.body);
  if (error) {
    throw createError(400);
  }
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !user.comparePassword(password)) {
    throw createError(401, "Email or password is wrong");
  }
  if (!user.verify) {
    throw createError(401, "Email not verify");
  }
  const payload = { id: user._id };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "6h" });
  await User.findByIdAndUpdate(user._id, { token });
  res.json({
    token: token,
    user: {
      email,
      password,
    },
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: null });
  res.status(204).json();
};

const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;
  res.json({
    user: {
      email,
      subscription,
    },
  });
};

const updateSubscription = async (req, res) => {
  const { _id } = req.user;
  const { subscription } = req.body;
  const { error } = joiSubscriptionSchema.validate({ subscription });
  if (error) {
    throw createError(400);
  }
  const result = await User.findByIdAndUpdate(
    _id,
    { subscription },
    { new: true }
  );
  res.json({
    email: result.email,
    subscription: result.subscription,
  });
};

const verifyEmail = async (req, res) => {
  const { verificationToken } = req.params;

  const user = await User.findOne({ verificationToken });

  if (!user) {
    throw createError(404, "User not found");
  }

  await User.findByIdAndUpdate(user._id, {
    verificationToken: null,
    verify: true,
  });

  res.json({
    message: "Verification successful",
  });
};

const resendVerifyEmail = async (req, res) => {
  const { error } = joiEmailSchema.validate(req.body);
  if (error) {
    throw createError(400);
  }
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw createError(404);
  }
  if (user.verify) {
    throw createError(400, "Verification has already been passed");
  }
  const mail = {
    to: email,
    subject: "Confirm email",
    html: `<a target="_blank" href="http://localhost:3000/api/users/verify/${user.verificationToken}">Confirm</a>`,
  };
  await sendMail(mail);
  res.json({
    message: "Verification email sent",
  });
};

module.exports = {
  signup,
  login,
  logout,
  getCurrent,
  updateSubscription,
  verifyEmail,
  resendVerifyEmail,
};
