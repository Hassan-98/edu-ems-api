const mongoose = require("mongoose");
const validator = require('validator');

const RequestsSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, "Request type is required!"],
    enum: {
      values: ['program', 'activation'],
      message: '{VALUE} is not valid request type!'
    },
    validate (requestType) {
      if (validator.isEmpty(requestType)) throw new Error("Request type can't be empty!")
    }
  },
  title: {
    type: String,
    required: [true, "Request title is required!"],
    minlength: [10, `Request title shouldn't be less than 10 characters`]
  },
  details: {
    type: String,
    required: [true, "Request details is required!"],
    minlength: [40, `Request details shouldn't be less than 40 characters`]
  },
  statue: {
    type: String,
    required: [true, "Statue is required"],
    default: "unhandled",
    enum: {
      values: ['unhandled', 'closed'],
      message: '{VALUE} is not valid request statue!'
    },
    validate (statue) {
      if (validator.isEmpty(statue)) throw new Error("Statue can't be empty")
    }
  },
  fullName: {
    type: String,
    trim: true,
    validate (fullName) {
      if (validator.isEmpty(fullName)) throw new Error("Fullname can't be empty")
    }
  },
  emailAddress: {
    type: String,
    trim: true,
    validate (email) {
      if (validator.isEmpty(email)) throw new Error("Email address can't be empty")
      else if (!validator.isEmail(email)) throw new Error(`${value} is not a valid email address!`)
    }
  },
  phone: {
    type: String,
    trim: true,
    validate (phone) {
      if (validator.isEmpty(phone)) throw new Error("Phone can't be empty")
    }
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User"
  },
}, { timestamps: true });

module.exports = mongoose.model("Request", RequestsSchema);
