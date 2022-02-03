const router = require('express').Router();
const logsController = require('../controllers/logs.controller');
const { Authenticated } = require('../middlewares/auth.middleware');

/* GET: Get All User Logs */
router.get('/', Authenticated, logsController.getAllLogs);

/* GET: Get Logs Stats */
router.get('/stats', Authenticated, logsController.getLogsStats);

/* GET: Get Logs By Time */
router.get('/byTime', Authenticated, logsController.getByTimeLogs);


module.exports = router;
