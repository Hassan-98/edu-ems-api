const LOG = require("../models/Logs.model");

const getAllLogs = async (req, res, next) => {
  try {
    const logs = await LOG.find({ user: req.user.id }, null, { sort: { createdAt: -1 } })
      .populate("user", { fisrtName: 1, lastName: 1, username: 1, email: 1, photo: 1 });

    res.json({ success: logs });
  } catch (err) {
    console.error(`Error while getAllLogs =>`, err.message);
    next(err);
  }
}

const getLogsStats = async (req, res, next) => {
  try {
    const logs = await LOG.find({ user: req.user.id }, null, { sort: { createdAt: -1 } });

    res.json({ success: logs });
  } catch (err) {
    console.error(`Error while getLogsStats =>`, err.message);
    next(err);
  }
}

const getByTimeLogs = async (req, res, next) => {
  try {
    const logs = await LOG.find({ user: req.user.id }, null, { sort: { createdAt: -1 } })
      .populate("user", { fisrtName: 1, lastName: 1, username: 1, email: 1, photo: 1 });

    res.json({ success: logs });
  } catch (err) {
    console.error(`Error while getAllLogs =>`, err.message);
    next(err);
  }
}

module.exports = {
  getAllLogs,
  getByTimeLogs,
  getLogsStats
};
