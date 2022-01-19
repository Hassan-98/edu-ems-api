const CryptoJS = require("crypto-js");
const USER = require("../models/Users.model");
const LOG = require("../models/Logs.model");

const getUser = async (req, res, next) => {
  try {
    const { userId } = req.query;

    if (!userId) throw new Error("User id is required as a query");

    if (userId !== req.user.id) throw new Error("You don't have permissions to get user info");

    const user = await USER.findById(userId)
      .select({ password: 0 })
      .populate("activations")
      .populate("logs");

    res.json({ success: user });
  } catch (err) {
    console.error(`Error while getUser =>`, err.message);
    next(err);
  }
}

const changeUserInfo = async (req, res, next) => {
  try {
    const { userId } = req.query;

    if (!userId) throw new Error("User id is required as a query");

    let userUpdates = req.body;

    if (userId !== req.user.id) throw new Error("You don't have permissions to change user info");

    if (userUpdates.role) throw new Error("You don't have permissions to change user role");

    if (userUpdates.availableActivations) throw new Error("You don't have permissions to change user available activations");

    const log = await LOG.create({ type: "change info", location: req.location, user: userId });

    userUpdates.$push = { logs: log._id };

    const user = await USER.findByIdAndUpdate(userId, userUpdates, { 
      new: true,
      runValidators: true
    })
      .select({ password: 0 })
      .populate("activations")
      .populate("logs");

    res.json({ success: user });
  } catch (err) {
    console.error(`Error while changeUserInfo =>`, err.message);
    next(err);
  }
}

const changeUserPassword = async (req, res, next) => {
  try {
    const { userId } = req.query;

    const { currentPassword, newPassword } = req.body;

    if (!userId) throw new Error("User id is required as a query");

    if (userId !== req.user.id) throw new Error("You don't have permissions to change user password");

    const user = await USER.findById(userId).select({ password: 1 });

    const decryptedPassword = CryptoJS.AES.decrypt(user.password, process.env.CRYPTO_SECRET).toString(CryptoJS.enc.Utf8);

    if (currentPassword !== decryptedPassword) throw new Error("Passwords doesn't match");

    if (newPassword.length < 6) throw new Error("New Password is too weak");

    user.password = CryptoJS.AES.encrypt(newPassword, process.env.CRYPTO_SECRET).toString();

    await user.save();

    const log = await LOG.create({ type: "change password", location: req.location, user: userId });

    await USER.findByIdAndUpdate(userId, { $push: { logs: log._id } });

    res.json({ success: { _id: userId } });
  } catch (err) {
    console.error(`Error while changeUserPassword =>`, err.message);
    next(err);
  }
}

module.exports = {
  getUser,
  changeUserInfo,
  changeUserPassword
};
