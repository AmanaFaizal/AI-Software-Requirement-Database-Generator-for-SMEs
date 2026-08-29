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

const categoryRoutes = require('./categoryRoutes');
router.use('/:businessId/categories', categoryRoutes);

const dealerRoutes = require('./dealerRoutes');
router.use('/:businessId/dealers', dealerRoutes);

const purchaseOrderRoutes = require('./purchaseOrderRoutes');
router.use('/:businessId/purchases', purchaseOrderRoutes);

const invoiceRoutes = require('./invoiceRoutes');
router.use('/:businessId/invoices', invoiceRoutes);

const reportRoutes = require('./reportRoutes');
router.use('/:businessId/reports', reportRoutes);

const reminderRoutes = require('./reminderRoutes');
router.use('/:businessId/reminders', reminderRoutes);

const expenseRoutes = require('./expenseRoutes');
router.use('/:businessId/expenses', expenseRoutes);

const saleRoutes = require('./saleRoutes');
router.use('/:businessId/sales', saleRoutes);

module.exports = router;
