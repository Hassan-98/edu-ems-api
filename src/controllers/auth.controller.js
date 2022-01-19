const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const USER = require("../models/Users.model");
const LOG = require("../models/Logs.model");
const nodemailer = require("nodemailer");
const createResetPasswordTemplate = require("../mails/resetPassword.mail");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_ACCOUNT,
    pass: process.env.GMAIL_PASSWORD
  }
});

const login = async (req, res, next) => {
  try {

    const { email, password, rememberMe } = req.body;

    const user = await USER.findOne({ email }).populate("activations").populate("logs");

    if (!user) throw new Error("Invalid email address or password");

    const decryptedPassword = CryptoJS.AES.decrypt(user.password, process.env.CRYPTO_SECRET).toString(CryptoJS.enc.Utf8);

    if (password !== decryptedPassword) throw new Error("Invalid email address or password");
      
    delete user.password;

    const token = jwt.sign({user: user._id, role: user.role}, process.env.JWT_SECRET, {expiresIn: rememberMe ? '7d' : '6h'});

    const log = await LOG.create({ type: "login", location: req.ip, user: user._id });

    const updatedUser = await USER.findByIdAndUpdate(user._id, { $push: { logs: log._id } }, { new: true, runValidators: true })
      .populate('activations')
      .populate('logs');

    res.json({ success: { user: updatedUser, token } });
  } catch (err) {
    console.error(`Error while login =>`, err.message);
    next(err);
  }
}

const validateToken = async (req, res, next) => {
   try {
      const { token } = req.body;

      const { user: userId } = jwt.verify(token, process.env.JWT_SECRET);

      if (!userId) throw new Error("Invalid token");

      const user = await USER.findById(userId)
        .populate("activations")
        .populate("logs");

      res.json({ success: user });
   } catch (err) {
      console.error(`Error while validating token =>`, err.message);
      next(err);
   }
};

// Reset Password
const resetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await USER.findOne({email});

    if (!user) throw new Error("This email address is not related to any account");

    const savedToken = user.resetToken;

    if (savedToken.token && savedToken.expiration > new Date().getTime()) throw new Error("Reset password email already sent to this email address");
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    user.resetToken = {
      token,
      expiration: new Date().getTime() + (60 * 60 * 1000)
    };
    
    await user.save();

    const resetPasswordTemplate = createResetPasswordTemplate({
      username: user.username,
      verifyLink: `${process.env.CLIENT_URL}/reset?t=${token}`
    })

    const mail_content = {
      from: "no-reply@edu-ems.cf",
      to: email,
      subject: "Reset Account Password - Edu. EMS",
      html: resetPasswordTemplate
    }

    transporter.sendMail(mail_content, (err, info) => {
      if (err) throw new Error(err);
      else {
        res.json({ success: info.response });
      }
    });

  } catch (err) {
    console.error(`Error while reseting password =>`, err.message);
    next(err);
  }
};

// change Password
const verifyResetTokenAndChangePassword = async (req, res, next) => {
  try {
    const { userId, token, newPassword } = req.body;
    
    const user = await USER.findById(userId);

    const savedToken = user.resetToken;

    if (!savedToken.token || savedToken.expiration < new Date().getTime()) throw new Error("Reset password session expired");

    jwt.verify(token, process.env.JWT_SECRET);

    user.password = CryptoJS.AES.encrypt(newPassword, process.env.CRYPTO_SECRET).toString();

    user.resetToken = {};

    await user.save();

    const log = await LOG.create({ type: "reset password", location: req.ip, user: user._id });

    await USER.findByIdAndUpdate(user._id, { $push: { logs: log._id } });
    
    res.json({ success: true });
  } catch (err) {
    console.error(`Error while verify reset token and change password =>`, err.message);
    next(err);
  }
};

module.exports = {
  login,
  validateToken,
  resetPassword,
  verifyResetTokenAndChangePassword
};
