const router = require('express').Router();
const logsController = require('../controllers/logs.controller');
const { Authenticated } = require('../middlewares/auth.middleware');

/* GET: Get All User Logs */
router.get('/', Authenticated, logsController.getAllLogs);


module.exports = router;
