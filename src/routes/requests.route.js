const router = require('express').Router();
const requestsController = require('../controllers/requests.controller');
const { Authenticated, AdminRole } = require('../middlewares/auth.middleware');

/* GET: Get All Program Requests */
router.get('/program', Authenticated, AdminRole, requestsController.getAllProgramRequests);

/* POST: Create Program Request */
router.post('/program', requestsController.createProgramRequest);

/* PUT: Close Program Request */
router.put('/program', Authenticated, AdminRole, requestsController.closeProgramRequest);

/* GET: Get All Activations Requests */
router.get('/activation', Authenticated, AdminRole, requestsController.getAllActivationsRequests);

/* POST: Create Activations Request */
router.post('/activation', Authenticated, requestsController.createActivationsRequest);

/* PUT: Close Activations Request */
router.put('/activation', Authenticated, AdminRole, requestsController.closeActivationsRequest);

/* DELETE: Delete Request */
router.delete('/', Authenticated, AdminRole, requestsController.deleteRequest);


module.exports = router;
