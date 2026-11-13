const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const SALT_ROUNDS = 10;

const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.SECRET_KEY, { expiresIn: "7d" });

const register = async (name, email, password) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw httpError(409, "User already exists!");

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ name, email, password: hashedPassword });

  return {
    message: "User registered successfully",
    token: signToken(user._id),
    name: user.name,
  };
};

const login = async (email, password) => {
  const user = await User.findOne({ email });
  const passwordMatch = user && (await bcrypt.compare(password, user.password));
  if (!passwordMatch) throw httpError(401, "Invalid Credentials");

  return {
    message: "User logged in successfully",
    token: signToken(user._id),
    name: user.name,
  };
};

const updateUser = async (userId, name, oldPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) throw httpError(404, "User not found");

  const passwordMatch = await bcrypt.compare(oldPassword, user.password);
  if (!passwordMatch) throw httpError(400, "Old password is incorrect");

  user.name = name;
  if (newPassword) {
    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
  }
  await user.save();

  return "User details updated successfully";
};

module.exports = { register, login, updateUser, httpError };
