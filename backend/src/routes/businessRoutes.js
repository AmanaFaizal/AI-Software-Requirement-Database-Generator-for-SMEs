const express = require('express');
const router = express.Router();
const businessController = require('../controllers/businessController');
const authMiddleware = require('../middleware/auth');
const productRoutes = require('./productRoutes');

router.use(authMiddleware);

router.post('/', businessController.createBusiness);
router.get('/', businessController.getMyBusinesses);
router.get('/:businessId', businessController.getBusiness);
router.put('/:businessId', businessController.updateBusiness);
router.delete('/:businessId', businessController.deleteBusiness);

// Nested product routes: /api/businesses/:businessId/products
router.use('/:businessId/products', productRoutes);

module.exports = router;
