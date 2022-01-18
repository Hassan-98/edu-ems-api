const ACTIVATION = require("../models/Activations.model");
const USER = require("../models/Users.model");
const LOG = require("../models/Logs.model");

const getAllActivations = async (req, res, next) => {
  try {
    const activations = await ACTIVATION.find({}, null, { sort: { createdAt: -1 } })
      .populate("user", { username: 1, email: 1, photo: 1, availableActivations: 1 });

    res.json({ success: activations });
  } catch (err) {
    console.error(`Error while getAllActivations =>`, err.message);
    next(err);
  }
}

const getActivationBySerialCode = async (req, res, next) => {
  try {
    const { serialCode } = req.params;

    if (!serialCode) throw new Error("Serial Code is required as a param");

    const activation = await ACTIVATION.findOne({ serialCode })
      .populate("user", { username: 1, email: 1, photo: 1, availableActivations: 1 });

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

    console.log(activationData);

    const { availableActivations } = await USER.findById(activationData.user).select({ availableActivations: 1 });

    if (availableActivations <= 0)  throw new Error("You don't have available activations to register");

    const activation = await ACTIVATION.create(activationData);

    const log = await LOG.create({ type: "register activation", location: req.ip, user: activationData.user });

    await USER.findByIdAndUpdate(activationData.user, { $push: { activations: activation._id, logs: log._id }, $inc: { availableActivations: -1 } })

    res.json({ success: activation });
  } catch (err) {
    console.error(`Error while registerActivation =>`, err.message);
    next(err);
  }
}

const resetActivation = async (req, res, next) => {
  try {
    const { activationId } = req.query;

    if (!activationId) throw new Error("Activation id is required as a query");

    const activation = await ACTIVATION.findById(activationId)
      .populate("user", { username: 1, email: 1, photo: 1, availableActivations: 1 });

    delete activation._doc.activationDate

    delete activation._doc.macAddress

    await activation.save();

    const log = await LOG.create({ type: "reset activation", location: req.ip, user: req.user.id });

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

    const log = await LOG.create({ type: "delete activation", location: req.ip, user: req.user.id });
    
    await USER.findByIdAndUpdate(req.user.id, { $pull: { activations: activationId }, $push: { logs: log._id } })

    res.json({ success: true });
  } catch (err) {
    console.error(`Error while deleteActivation =>`, err.message);
    next(err);
  }
}

module.exports = {
  getAllActivations,
  getActivationBySerialCode,
  registerActivation,
  resetActivation,
  deleteActivation
};
