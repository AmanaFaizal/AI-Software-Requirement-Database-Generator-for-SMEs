const express = require('express');
const router = express.Router({ mergeParams: true });
const invoiceController = require('../controllers/invoiceController');

router.get('/', invoiceController.getInvoices);

module.exports = router;
