const { Invoice } = require('../models');
const { assertOwnedBusiness } = require('./businessController');

exports.getInvoices = async (req, res) => {
  try {
    const { businessId } = req.params;
    const business = await assertOwnedBusiness(businessId, req.user.user_id);
    if (!business) return res.status(403).json({ message: 'Not authorized.' });

    const invoices = await Invoice.findAll({ where: { business_id: businessId } });
    return res.json({ invoices });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
