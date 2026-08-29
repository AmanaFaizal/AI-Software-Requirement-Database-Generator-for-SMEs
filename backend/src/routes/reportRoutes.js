const express = require('express');
const router = express.Router({ mergeParams: true });
const reportController = require('../controllers/reportController');

router.get('/sales', reportController.getSalesReport);

module.exports = router;
