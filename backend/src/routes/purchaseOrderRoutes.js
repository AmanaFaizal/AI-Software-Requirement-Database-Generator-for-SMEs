const express = require('express');
const router = express.Router({ mergeParams: true });
const purchaseOrderController = require('../controllers/purchaseOrderController');

router.get('/', purchaseOrderController.getPurchases);
router.post('/', purchaseOrderController.createPurchase);
router.put('/:purchaseId/status', purchaseOrderController.updatePurchaseStatus);

module.exports = router;
