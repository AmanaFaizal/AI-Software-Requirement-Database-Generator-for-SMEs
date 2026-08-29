const { Expense } = require('../models');
const { assertOwnedBusiness } = require('./businessController');

exports.getExpenses = async (req, res) => {
  try {
    const { businessId } = req.params;
    const business = await assertOwnedBusiness(businessId, req.user.user_id);
    if (!business) return res.status(403).json({ message: 'Not authorized.' });

    const expenses = await Expense.findAll({ where: { business_id: businessId } });
    return res.json({ expenses });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.createExpense = async (req, res) => {
  try {
    const { businessId } = req.params;
    const business = await assertOwnedBusiness(businessId, req.user.user_id);
    if (!business) return res.status(403).json({ message: 'Not authorized.' });

    const { category, amount, description, expense_date } = req.body;
    if (!category || !amount) return res.status(400).json({ message: 'Category and Amount are required' });

    const expense = await Expense.create({ 
      business_id: businessId, 
      category, 
      amount, 
      description,
      expense_date: expense_date || new Date()
    });
    return res.status(201).json({ expense });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const { businessId, expenseId } = req.params;
    const business = await assertOwnedBusiness(businessId, req.user.user_id);
    if (!business) return res.status(403).json({ message: 'Not authorized.' });

    const expense = await Expense.findOne({ where: { expense_id: expenseId, business_id: businessId } });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    await expense.destroy();
    return res.json({ message: 'Expense deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
