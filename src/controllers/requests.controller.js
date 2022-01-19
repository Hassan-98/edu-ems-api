const REQUEST = require("../models/Requests.model");
const USER = require("../models/Users.model");
const LOG = require("../models/Logs.model");

const getAllProgramRequests = async (req, res, next) => {
  try {
    const programRequests = await REQUEST.find({ type: 'program' }, null, { sort: { createdAt: -1 } });

    res.json({ success: programRequests });
  } catch (err) {
    console.error(`Error while getAllLogs =>`, err.message);
    next(err);
  }
}

const createProgramRequest = async (req, res, next) => {
  try {
    const programRequestData = req.body;
    
    const request = await REQUEST.create({ ...programRequestData, type: 'program' });

    res.json({ success: request });
  } catch (err) {
    console.error(`Error while getAllLogs =>`, err.message);
    next(err);
  }
}

const closeProgramRequest = async (req, res, next) => {
  try {
    const { requestId } = req.query;

    if (!requestId) throw new Error("Request id is required as a query");

    const programRequest = await REQUEST.findByIdAndUpdate(requestId, { statue: 'closed' }, { 
      new: true,
      runValidators: true
    });

    res.json({ success: programRequest });
  } catch (err) {
    console.error(`Error while getAllLogs =>`, err.message);
    next(err);
  }
}

const getAllActivationsRequests = async (req, res, next) => {
  try {
    const activationRequests = await REQUEST.find({ type: 'activation' }, null, { sort: { createdAt: -1 } })
      .populate("user", { username: 1, email: 1, photo: 1, availableActivations: 1 });

    res.json({ success: activationRequests });
  } catch (err) {
    console.error(`Error while getAllLogs =>`, err.message);
    next(err);
  }
}

const createActivationsRequest = async (req, res, next) => {
  try {
    const activationRequestData = req.body;
    
    const request = await REQUEST.create({ ...activationRequestData, user: req.user.id, type: 'activation' });

    const log = await LOG.create({ type: "request activation", location: req.ip, user: req.user.id });

    await USER.findByIdAndUpdate(req.user.id, { $push: { logs: log._id } });

    res.json({ success: request });
  } catch (err) {
    console.error(`Error while getAllLogs =>`, err.message);
    next(err);
  }
}

const closeActivationsRequest = async (req, res, next) => {
  try {
    const { requestId } = req.query;

    if (!requestId) throw new Error("Request id is required as a query");

    const activationRequest = await REQUEST.findByIdAndUpdate(requestId, { statue: 'closed' }, { 
      new: true,
      runValidators: true
    }).populate("user", { username: 1, email: 1, photo: 1, availableActivations: 1 });

    res.json({ success: activationRequest });
  } catch (err) {
    console.error(`Error while getAllLogs =>`, err.message);
    next(err);
  }
}

const deleteRequest = async (req, res, next) => {
  try {
    const { requestId } = req.query;

    if (!requestId) throw new Error("Request id is required as a query");

    const deletedRequest = await REQUEST.findByIdAndDelete(requestId);

    if (!deletedRequest) throw new Error("Request doesn't exist");

    res.json({ success: true });
  } catch (err) {
    console.error(`Error while getAllLogs =>`, err.message);
    next(err);
  }
}

module.exports = {
  getAllProgramRequests,
  createProgramRequest,
  closeProgramRequest,
  getAllActivationsRequests,
  createActivationsRequest,
  closeActivationsRequest,
  deleteRequest
};
