const router = require('express').Router();
const usersController = require('../controllers/users.controller');
const { Authenticated } = require('../middlewares/auth.middleware');

/* GET: Get User By Id */
router.get('/', Authenticated, usersController.getUser);

/* PUT: Update User Data: (Change Info) */
router.put('/change-info', Authenticated, usersController.changeUserInfo);

/* PUT: Update User Data: (Change Password) */
router.put('/change-password', Authenticated, usersController.changeUserPassword);


module.exports = router;
