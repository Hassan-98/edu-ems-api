const CryptoJS = require("crypto-js");
const USER = require("../models/Users.model");
const ACTIVATION = require("../models/Activations.model");
const REQUEST = require("../models/Requests.model");
const LOG = require("../models/Logs.model");
const { Types: { ObjectId } } = require("mongoose");
const createSession = require("../utils/createSession");

const getAllClients = async (req, res, next) => {
  try {
    const clients = await USER.find({}, { password: 0 }, { sort: { createdAt: -1 } })
      .populate("activations")
      .populate("logs");

    res.json({ success: clients });
  } catch (err) {
    console.error(`Error while getAllClients =>`, err.message);
    next(err);
  }
}

const getClientById = async (req, res, next) => {
  try {
    const { clientId } = req.params;

    if (!clientId) throw new Error("Client id is required as a param");

    const client = await USER.findById(clientId)
      .select({ password: 0 })
      .populate("activations")
      .populate("logs");

    if (!client) throw new Error("Client is not found");

    res.json({ success: client });
  } catch (err) {
    console.error(`Error while getClientById =>`, err.message);
    next(err);
  }
}

const createClient = async (req, res, next) => {
  try {
    const client = await USER.create(req.body);

    client.password = CryptoJS.AES.encrypt(req.body.password, process.env.CRYPTO_SECRET).toString();

    await client.save();

    delete client.password;

    res.json({ success: client });
  } catch (err) {
    console.error(`Error while createClient =>`, err.message);
    next(err);
  }
}

const changeClientPassword = async (req, res, next) => {
  try {
    const { clientId } = req.query;

    const { newPassword } = req.body;

    if (!clientId) throw new Error("Client id is required as a query");

    const client = await USER.findById(clientId);

    client.password = CryptoJS.AES.encrypt(newPassword, process.env.CRYPTO_SECRET).toString();

    await client.save();

    delete client.password;

    res.json({ success: client });
  } catch (err) {
    console.error(`Error while changeClientPassword =>`, err.message);
    next(err);
  }
}

const addActivationsToClient = async (req, res, next) => {
  try {
    const { clientId } = req.query;

    const { activations } = req.body;

    if (!clientId) throw new Error("Client id is required as a query");

    const client = await USER.findByIdAndUpdate(clientId, { $inc: { availableActivations: activations } }, { 
      new: true,
      runValidators: true
    }).select({ password: 0 });

    res.json({ success: client });
  } catch (err) {
    console.error(`Error while addActivationsToClient =>`, err.message);
    next(err);
  }
}

const deleteClient = async (req, res, next) => {
  try {
    const { clientId } = req.query;

    if (!clientId) throw new Error("Client id is required as a query");

    let deletedClient;

    const session = await createSession();

    await session.withTransaction(async () => {
      deletedClient = await USER.findByIdAndDelete(clientId);

      if (!deletedClient) throw new Error("Client doesn't exist");

      await ACTIVATION.deleteMany({ user: ObjectId(clientId) });

      await REQUEST.deleteMany({ user: ObjectId(clientId) });

      await LOG.deleteMany({ user: ObjectId(clientId) });
    });

    session.endSession();

    res.json({ success: true });
  } catch (err) {
    console.error(`Error while deleteClient =>`, err.message);
    next(err);
  }
}

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  changeClientPassword,
  addActivationsToClient,
  deleteClient
};
