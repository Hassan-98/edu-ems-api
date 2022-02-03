const router = require('express').Router();
const logsController = require('../controllers/logs.controller');
const { Authenticated } = require('../middlewares/auth.middleware');

/* GET: Get All User Logs */
router.get('/', Authenticated, logsController.getAllLogs);

/* GET: Get Logs Stats */
router.get('/range-stats', Authenticated, logsController.getByRangeLogs);

/* GET: Get Logs By Time */
router.get('/period-stats', Authenticated, logsController.getByPeriodLogs);


module.exports = router;
