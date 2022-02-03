const LOG = require("../models/Logs.model");
const dayjs = require("dayjs");
const { ObjectId } = require("mongodb");

const getAllLogs = async (req, res, next) => {
  try {
    const logs = await LOG.find({ user: req.user.id }, null, { sort: { createdAt: -1 } })
      .populate("user", { firstName: 1, lastName: 1, username: 1, email: 1, photo: 1 });

    res.json({ success: logs });
  } catch (err) {
    console.error(`Error while getAllLogs =>`, err.message);
    next(err);
  }
}

const getByRangeLogs = async (req, res, next) => {
  try {
    let dateRange = +req.query.range;

    if (!dateRange) dateRange = 1;

    const logs = await LOG.find({ 
      user: req.user.id,
      createdAt: {
        $gte: dayjs(new Date().setDate(new Date().getDate() - dateRange)).endOf('day').toDate(),
        $lte: dayjs(Date.now()).endOf('day').toDate()
      }
    }, null, { sort: { createdAt: -1 } })
      .populate("user", { firstName: 1, lastName: 1, username: 1, email: 1, photo: 1 });

    res.json({ success: logs });
  } catch (err) {
    console.error(`Error while getLogsStats =>`, err.message);
    next(err);
  }
}

const getByPeriodLogs = async (req, res, next) => {
  try {
    let period = req.query.period;

    if (!period || ['daily', 'monthly'].indexOf(period) === -1) period = 'daily';

    let periods = {
      'daily': 'week',
      'monthly': 'year'
    }

    const time = periods[period];

    const logs = await LOG.aggregate([
      {
        $match: {
          user: ObjectId(req.user.id),
          createdAt: {
            $gte: dayjs(Date.now()).startOf(time).toDate(),
            $lte: dayjs(Date.now()).endOf(time).toDate()
          }
        }
      },
      {
        $sort: { createdAt: 1 } 
      },
      {
        $project: {
          date: {
            $dateToString: {
              date: "$createdAt",
              format: period === 'daily' ? "%w" : "%m",
              timezone: "+02:00"
            }
          }
        }
      },
      {
        $group: {
          _id: '$date',
          times: {
            $sum: 1
          }
        }
      },
      {
        $sort: { _id: 1 } 
      }
    ]);

    const dailyTimes = {
      '1': 'Sun',
      '2': 'Mon',
      '3': 'Tue',
      '4': 'Wed',
      '5': 'Thu',
      '6': 'Fri',
      '7': 'Sat'
    }

    const monthlyTimes = {
      '01': 'Jan',
      '02': 'Feb',
      '03': 'Mar',
      '04': 'Apr',
      '05': 'May',
      '06': 'Jun',
      '07': 'Jul',
      '8': 'Aug',
      '09': 'Sep',
      '10': 'Oct',
      '11': 'Nov',
      '12': 'Dec'
    }

    const Times = period === 'daily' ? dailyTimes : monthlyTimes

    const handledLogs = logs.length ? logs.map(log => ({
      time: Times[log._id],
      times: log.times
    })) : [];

    res.json({ success: handledLogs });
  } catch (err) {
    console.error(`Error while getAllLogs =>`, err.message);
    next(err);
  }
}

module.exports = {
  getAllLogs,
  getByRangeLogs,
  getByPeriodLogs
};
