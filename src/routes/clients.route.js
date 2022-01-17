const router = require('express').Router();
const clientsController = require('../controllers/clients.controller');
const { Authenticated, AdminRole } = require('../middlewares/auth.middleware');

/* GET: Get All Clients */
router.get('/', Authenticated, AdminRole, clientsController.getAllClients);

/* GET: Get Client By Id */
router.get('/:clientId', Authenticated, clientsController.getClientById);

/* POST: Create Client */
router.post('/', Authenticated, AdminRole, clientsController.createClient);

/* PUT: Update Client Data: (Change Password) */
router.put('/change-password', Authenticated, AdminRole, clientsController.changeClientPassword);

/* PUT: Update Client Data: (Add Activations) */
router.put('/add-activations', Authenticated, AdminRole, clientsController.addActivationsToClient);

/* DELETE: Delete Client Data */
router.delete('/', Authenticated, AdminRole, clientsController.deleteClient);


module.exports = router;
