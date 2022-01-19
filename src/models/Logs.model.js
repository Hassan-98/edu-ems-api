const mongoose = require("mongoose");
const validator = require('validator');

const LogsSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, "Log type is required!"],
    enum: {
      values: ['login', 'reset password', 'change info', 'change password', 'register activation', 'request activation', 'reset activation', 'delete activation'],
      message: '{VALUE} is not valid log type!'
    },
    validate (type) {
      if (validator.isEmpty(type)) throw new Error("Log type can't be empty!")
    }
  },
  location: {
    type: Object,
    required: [true, "Log location is required!"]
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: [true, "User is required"],
  },
}, { timestamps: true });

module.exports = mongoose.model("Log", LogsSchema);
