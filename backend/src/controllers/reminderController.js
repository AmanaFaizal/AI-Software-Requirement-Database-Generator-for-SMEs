const { Reminder } = require('../models');
const { assertOwnedBusiness } = require('./businessController');

exports.getReminders = async (req, res) => {
  try {
    const { businessId } = req.params;
    const business = await assertOwnedBusiness(businessId, req.user.user_id);
    if (!business) return res.status(403).json({ message: 'Not authorized.' });

    const reminders = await Reminder.findAll({ where: { business_id: businessId } });
    return res.json({ reminders });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.createReminder = async (req, res) => {
  try {
    const { businessId } = req.params;
    const business = await assertOwnedBusiness(businessId, req.user.user_id);
    if (!business) return res.status(403).json({ message: 'Not authorized.' });

    const { title, reminder_date } = req.body;
    if (!title || !reminder_date) return res.status(400).json({ message: 'Title and Date are required' });

    const reminder = await Reminder.create({ business_id: businessId, title, reminder_date });
    return res.status(201).json({ reminder });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.updateReminder = async (req, res) => {
  try {
    const { businessId, reminderId } = req.params;
    const business = await assertOwnedBusiness(businessId, req.user.user_id);
    if (!business) return res.status(403).json({ message: 'Not authorized.' });

    const reminder = await Reminder.findOne({ where: { reminder_id: reminderId, business_id: businessId } });
    if (!reminder) return res.status(404).json({ message: 'Reminder not found' });

    const { title, reminder_date, status } = req.body;
    if (title) reminder.title = title;
    if (reminder_date) reminder.reminder_date = reminder_date;
    if (status) reminder.status = status;

    await reminder.save();
    return res.json({ reminder });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteReminder = async (req, res) => {
  try {
    const { businessId, reminderId } = req.params;
    const business = await assertOwnedBusiness(businessId, req.user.user_id);
    if (!business) return res.status(403).json({ message: 'Not authorized.' });

    const reminder = await Reminder.findOne({ where: { reminder_id: reminderId, business_id: businessId } });
    if (!reminder) return res.status(404).json({ message: 'Reminder not found' });

    await reminder.destroy();
    return res.json({ message: 'Reminder deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
