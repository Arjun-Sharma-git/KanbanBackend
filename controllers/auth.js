const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const register = async (name, email, password) => {
  try {
    const isExistingUser = await User.findOne({ email: email });
    if (isExistingUser) throw new Error("User already exists!");
    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = new User({
      name,
      email,
      password: hashedPassword,
    });

    const userResponse = await userData.save();
    const id = userResponse._id;
    const token = jwt.sign({ userId: id }, process.env.SECRET_KEY);

    const data = {
      message: "User registered successfully",
      token: token,
      name: name,
    };
    return data;
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
};

const login = async (email, password) => {
  try {
    const userInfo = await User.findOne({ email });
    if (!userInfo) throw new Error("Invalid Credentials");

    const passwordMatch = await bcrypt.compare(password, userInfo.password);
    if (!passwordMatch) throw new Error("Invalid Credentials");

    const token = jwt.sign({ userId: userInfo._id }, process.env.SECRET_KEY);
    const data = {
      message: "User logged in successfully",
      token: token,
      name: userInfo.name,
    };
    return data;
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

const updateUser = async (userId, name, oldPassword, newPassword) => {
  try {
    const userInfo = await User.findById(userId);
    const passwordMatch = await bcrypt.compare(
      oldPassword,
      userInfo.password
    );
    if (!passwordMatch) throw new Error("Passwords ");

    userInfo.name = name;
    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      userInfo.password = hashedPassword;
    }

    userInfo.save();
    const data = "User updation success!!";
    return data;
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};


module.exports = { register, login, updateUser };