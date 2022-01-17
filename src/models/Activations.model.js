const mongoose = require("mongoose");
const validator = require('validator');

const ActivationsSchema = new mongoose.Schema({
  serialCode: {
    type: String,
    required: [true, "Serial code is required"],
    unique: [true, "Serial code is already exist"],
    trim: true,
    validate (serialCode) {
      if (validator.isEmpty(serialCode)) throw new Error("Serial code can't be empty")
      else if (!validator.isUUID(serialCode)) throw new Error("Serial code is not valid")
    }
  },
  macAddress: {
    type: String,
    trim: true,
    validate (macAddress) {
      if (validator.isEmpty(macAddress)) throw new Error("MAC Address can't be empty")
      else if (!validator.isMACAddress(macAddress)) throw new Error("MAC Address is not valid")
    }
  },
  activationDate: {
    type: String,
    validate (activationDate) {
      if (validator.isEmpty(activationDate)) throw new Error("Activation date can't be empty")
    }
  },
  registerationDate: {
    type: String,
    required: [true, "Registeration date is required"],
    validate (registerationDate) {
      if (validator.isEmpty(registerationDate)) throw new Error("Registeration date can't be empty")
    }
  },
  statue: {
    type: String,
    required: [true, "Statue is required"],
    enum: {
      values: ['Active', 'Idle'],
      message: '{VALUE} is not a valid statue!'
    },
    validate (statue) {
      if (validator.isEmpty(statue)) throw new Error("Statue can't be empty")
    }
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: [true, "User is required"],
  },
}, { timestamps: true });

module.exports = mongoose.model("Activation", ActivationsSchema);
