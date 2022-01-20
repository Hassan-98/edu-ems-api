const ACTIVATION = require("../models/Activations.model");
const USER = require("../models/Users.model");
const LOG = require("../models/Logs.model");
const macaddr = require("macaddr");
const validator = require('validator');
const dayjs = require("dayjs");

const getAllActivations = async (req, res, next) => {
  try {
    const activations = await ACTIVATION.find({ user: req.user.id }, null, { sort: { createdAt: -1 } })
      .populate("user", { username: 1, email: 1, photo: 1, availableActivations: 1 });

    res.json({ success: activations });
  } catch (err) {
    console.error(`Error while getAllActivations =>`, err.message);
    next(err);
  }
}

const validateActivationBySerialCode = async (req, res, next) => {
  try {
    const { serialCode, macAddress } = req.body;

    if (!serialCode) throw new Error("Serial Code is required!");

    if (!macAddress) throw new Error("MAC Address is required!");

    const activation = await ACTIVATION.findOne({ serialCode })
      .populate("user", { username: 1, email: 1, photo: 1, availableActivations: 1 });
    
    if (!activation) throw new Error("Invalid activation serial code");

    const sentMACCheck = validator.isMACAddress(macAddress);

    if (!sentMACCheck) throw new Error("Invalid activation MAC Address");

    const sentMAC = macaddr.parse(macAddress);
    const savedMAC = macaddr.parse(activation.macAddress);

    const result = sentMAC.compare(savedMAC);

    if (result !== 0) throw new Error("Invalid activation please reactivate again");

    res.json({ success: activation });
  } catch (err) {
    console.error(`Error while getActivationBySerialCode =>`, err.message);
    next(err);
  }
}

const registerActivation = async (req, res, next) => {
  try {
    const activationData = {
      ...req.body,
      user: req.user.id
    }

    const { availableActivations } = await USER.findById(activationData.user).select({ availableActivations: 1 });

    if (availableActivations <= 0)  throw new Error("You don't have available activations to register");

    const activation = await ACTIVATION.create(activationData);

    const log = await LOG.create({ type: "register activation", location: req.location, user: activationData.user });

    await USER.findByIdAndUpdate(activationData.user, { $push: { activations: activation._id, logs: log._id }, $inc: { availableActivations: -1 } })

    res.json({ success: activation });
  } catch (err) {
    console.error(`Error while registerActivation =>`, err.message);
    next(err);
  }
}

const activateActivation = async (req, res, next) => {
  try {
    const { serialCode } = req.params;

    const { macAddress } = req.body;

    if (!serialCode) throw new Error("Serial Code is required as a param");

    if (!macAddress) throw new Error("MAC Address is required");

    const activation = await ACTIVATION.findOne({ serialCode })
      .populate("user", { username: 1, email: 1, photo: 1, availableActivations: 1 });

    if (!activation) throw new Error("Invalid activation serial code");

    console.log(activation.macAddress.toLowerCase(), macAddress.toLowerCase());

    if (activation.activationDate !== '-' || (activation.macAddress !== '-' && activation.macAddress.toLowerCase() !== macAddress.toLowerCase())) throw new Error("Activation is already active on another device");

    if (activation.macAddress.toLowerCase() === macAddress.toLowerCase()) return res.json({ success: activation });

    activation.activationDate = dayjs(new Date()).format("DD/MM/YYYY | hh:mm a");
    activation.macAddress = macAddress;
    activation.statue = "Active";

    await activation.save();

    res.json({ success: activation });
  } catch (err) {
    console.error(`Error while resetActivation =>`, err.message);
    next(err);
  }
}

const resetActivation = async (req, res, next) => {
  try {
    const { activationId } = req.query;

    if (!activationId) throw new Error("Activation id is required as a query");

    const activation = await ACTIVATION.findById(activationId)
      .populate("user", { username: 1, email: 1, photo: 1, availableActivations: 1 });

    if (!activation.activationDate && !activation.macAddress) throw new Error("Cannot reset Idle activation");

    activation.activationDate = "-";
    activation.macAddress = "-";
    activation.statue = "Idle";

    await activation.save();

    const log = await LOG.create({ type: "reset activation", location: req.location, user: req.user.id });

    await USER.findByIdAndUpdate(req.user.id, { $push: { logs: log._id } });

    res.json({ success: activation });
  } catch (err) {
    console.error(`Error while resetActivation =>`, err.message);
    next(err);
  }
}

const deleteActivation = async (req, res, next) => {
  try {
    const { activationId } = req.query;

    if (!activationId) throw new Error("Activation id is required as a query");

    const deletedActivation = await ACTIVATION.findByIdAndDelete(activationId);

    if (!deletedActivation) throw new Error("Activation doesn't exist");

    const log = await LOG.create({ type: "delete activation", location: req.location, user: req.user.id });
    
    await USER.findByIdAndUpdate(req.user.id, { $pull: { activations: activationId }, $push: { logs: log._id }, $inc: { availableActivations: +1 } })

    res.json({ success: true });
  } catch (err) {
    console.error(`Error while deleteActivation =>`, err.message);
    next(err);
  }
}

module.exports = {
  getAllActivations,
  validateActivationBySerialCode,
  activateActivation,
  registerActivation,
  resetActivation,
  deleteActivation
};
