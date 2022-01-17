const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { NotAuthenticated } = require('../middlewares/auth.middleware');

/* POST: Login */
router.post('/', NotAuthenticated, authController.login);

/* POST: Validate Login Token */
router.post('/validate', NotAuthenticated, authController.validateToken);

/* POST: Reset Password */
router.post('/reset', NotAuthenticated, authController.resetPassword);

/* PUT: Verify Reset Token And Change Password */
router.put('/verify-change', NotAuthenticated, authController.verifyResetTokenAndChangePassword);

module.exports = router;
