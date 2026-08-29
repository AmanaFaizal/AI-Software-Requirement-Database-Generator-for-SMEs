const express = require('express');
const router = express.Router({ mergeParams: true });
const dealerController = require('../controllers/dealerController');

router.get('/', dealerController.getDealers);
router.post('/', dealerController.createDealer);
router.put('/:dealerId', dealerController.updateDealer);
router.delete('/:dealerId', dealerController.deleteDealer);

module.exports = router;
