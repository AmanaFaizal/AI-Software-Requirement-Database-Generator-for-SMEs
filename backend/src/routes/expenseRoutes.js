const express = require('express');
const router = express.Router({ mergeParams: true });
const expenseController = require('../controllers/expenseController');

router.get('/', expenseController.getExpenses);
router.post('/', expenseController.createExpense);
router.delete('/:expenseId', expenseController.deleteExpense);

module.exports = router;
