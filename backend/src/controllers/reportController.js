const { Sale, Purchase, Expense, sequelize } = require('../models');
const { assertOwnedBusiness } = require('./businessController');

exports.getSalesReport = async (req, res) => {
  try {
    const { businessId } = req.params;
    const business = await assertOwnedBusiness(businessId, req.user.user_id);
    if (!business) return res.status(403).json({ message: 'Not authorized.' });

    // Aggregate sales. For simplicity, just summing total_amount of all sales.
    const totalSalesAmount = await Sale.sum('total_amount', { where: { business_id: businessId } }) || 0;
    
    // Total purchases
    const totalPurchasesAmount = await Purchase.sum('total_amount', { where: { business_id: businessId } }) || 0;

    // Total expenses
    const totalExpensesAmount = await Expense.sum('amount', { where: { business_id: businessId } }) || 0;

    return res.json({ 
      report: {
        totalSales: totalSalesAmount,
        totalPurchases: totalPurchasesAmount,
        totalExpenses: totalExpensesAmount,
        profit: totalSalesAmount - (totalPurchasesAmount + totalExpensesAmount)
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
