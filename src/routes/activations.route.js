const router = require('express').Router();
const activationsController = require('../controllers/activations.controller');
const { Authenticated } = require('../middlewares/auth.middleware');

/* GET: Get All User Activations */
router.get('/', Authenticated, activationsController.getAllActivations);

/* GET: Get Activation By Serial Code */
router.get('/:serialCode', activationsController.getActivationBySerialCode);

/* POST: Activate Activation By Serial Code */
router.post('/:serialCode', activationsController.activateActivation);

/* POST: Register User Activation */
router.post('/', Authenticated, activationsController.registerActivation);

/* PUT: Reset User Activation */
router.put('/', Authenticated, activationsController.resetActivation);

/* DELETE: Delete User Activaion */
router.delete('/', Authenticated, activationsController.deleteActivation);


module.exports = router;
