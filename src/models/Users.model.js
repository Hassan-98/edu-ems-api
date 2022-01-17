const mongoose = require("mongoose");
const validator = require('validator');

const UsersSchema = new mongoose.Schema({
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: [true, "Username is already exists"],
    trim: true,
    validate (username) {
      if (!username.match(/^[a-zA-Z0-9](_(?!(\.|_))|\.(?!(_|\.))|[a-zA-Z0-9]){6,18}[a-zA-Z0-9]$/)) throw new Error(`${username} is not a valid username!`)
      else if (validator.isEmpty(username)) throw new Error("Username can't be empty")
    }
  },
  email: {
    type: String,
    required: [true, "Email address is required"],
    unique: [true, "Email address is already exists"],
    trim: true,
    validate (email) {
      if (validator.isEmpty(email)) throw new Error("Email address can't be empty")
      else if (!validator.isEmail(email)) throw new Error(`${email} is not a valid email address!`)
    }
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, `Password shouldn't be less than 6 characters`]
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  photo: {
    type: String,
    default: "https://cdn-icons-png.flaticon.com/512/149/149071.png"
  },
  role: {
    type: String,
    required: [true, "User role is required"],
    enum: {
      values: ['admin', 'client'],
      message: '{VALUE} is not valid user role!'
    },
    validate (role) {
      if (validator.isEmpty(role)) throw new Error("role can't be empty!")
    },
  },
  availableActivations: {
    type: Number,
    default: 0
  },
  activations: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Activation"
    }
  ],
  logs: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Log"
    }
  ],
  resetToken: {
    token: {
      type: String,
      validate (token) {
        if (validator.isEmpty(token)) throw new Error("token can't be empty!")
        else if (!validator.isJWT(token)) throw new Error("token is not valid!")
      }
    },
    expiration: {
      type: Date
    },
  }
  
}, { timestamps: true });

module.exports = mongoose.model("User", UsersSchema);
