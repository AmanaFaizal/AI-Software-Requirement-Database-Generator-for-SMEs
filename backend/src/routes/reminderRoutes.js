const express = require('express');
const router = express.Router({ mergeParams: true });
const reminderController = require('../controllers/reminderController');

router.get('/', reminderController.getReminders);
router.post('/', reminderController.createReminder);
router.put('/:reminderId', reminderController.updateReminder);
router.delete('/:reminderId', reminderController.deleteReminder);

module.exports = router;
