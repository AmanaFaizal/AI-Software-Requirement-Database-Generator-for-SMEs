const { Purchase, Product, Invoice, sequelize } = require('../models');
const { assertOwnedBusiness } = require('./businessController');

exports.getPurchases = async (req, res) => {
  try {
    const { businessId } = req.params;
    const business = await assertOwnedBusiness(businessId, req.user.user_id);
    if (!business) return res.status(403).json({ message: 'Not authorized.' });

    const purchases = await Purchase.findAll({ where: { business_id: businessId } });
    return res.json({ purchases });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.createPurchase = async (req, res) => {
  try {
    const { businessId } = req.params;
    const business = await assertOwnedBusiness(businessId, req.user.user_id);
    if (!business) return res.status(403).json({ message: 'Not authorized.' });

    const { supplier_id, purchase_date, total_amount, is_ordered } = req.body;

    const purchase = await Purchase.create({
      business_id: businessId,
      supplier_id,
      purchase_date: purchase_date || new Date(),
      total_amount: total_amount || 0,
      is_ordered: is_ordered || false,
    });
    
    return res.status(201).json({ purchase });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.updatePurchaseStatus = async (req, res) => {
  try {
    const { businessId, purchaseId } = req.params;
    const business = await assertOwnedBusiness(businessId, req.user.user_id);
    if (!business) return res.status(403).json({ message: 'Not authorized.' });

    const purchase = await Purchase.findOne({ where: { purchase_id: purchaseId, business_id: businessId } });
    if (!purchase) return res.status(404).json({ message: 'Purchase not found' });

    const { is_ordered, is_delivered, is_paid } = req.body;
    
    const wasDeliveredBefore = purchase.is_delivered;

    if (is_ordered !== undefined) purchase.is_ordered = is_ordered;
    if (is_paid !== undefined) purchase.is_paid = is_paid;
    if (is_delivered !== undefined) purchase.is_delivered = is_delivered;

    await purchase.save();

    // If it just became delivered, we would ideally update stock based on PurchaseItems (assuming we build that out).
    // Also generate an invoice
    let invoice = null;
    if (purchase.is_delivered && !wasDeliveredBefore) {
      invoice = await Invoice.create({
        business_id: businessId,
        purchase_id: purchase.purchase_id,
        amount: purchase.total_amount,
        invoice_number: `INV-PUR-${purchase.purchase_id}`,
      });
    }

    return res.json({ purchase, invoice });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
