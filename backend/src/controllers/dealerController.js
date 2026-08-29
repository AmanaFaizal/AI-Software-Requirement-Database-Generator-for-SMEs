const { Supplier } = require('../models');
const { assertOwnedBusiness } = require('./businessController');

exports.getDealers = async (req, res) => {
  try {
    const { businessId } = req.params;
    const business = await assertOwnedBusiness(businessId, req.user.user_id);
    if (!business) return res.status(403).json({ message: 'Not authorized.' });

    const dealers = await Supplier.findAll({ where: { business_id: businessId } });
    return res.json({ dealers });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.createDealer = async (req, res) => {
  try {
    const { businessId } = req.params;
    const business = await assertOwnedBusiness(businessId, req.user.user_id);
    if (!business) return res.status(403).json({ message: 'Not authorized.' });

    const { supplier_name, phone, address } = req.body;
    if (!supplier_name) return res.status(400).json({ message: 'Supplier/Dealer name is required' });

    const dealer = await Supplier.create({ business_id: businessId, supplier_name, phone, address });
    return res.status(201).json({ dealer });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.updateDealer = async (req, res) => {
  try {
    const { businessId, dealerId } = req.params;
    const business = await assertOwnedBusiness(businessId, req.user.user_id);
    if (!business) return res.status(403).json({ message: 'Not authorized.' });

    const dealer = await Supplier.findOne({ where: { supplier_id: dealerId, business_id: businessId } });
    if (!dealer) return res.status(404).json({ message: 'Dealer not found' });

    const { supplier_name, phone, address } = req.body;
    if (supplier_name) dealer.supplier_name = supplier_name;
    if (phone !== undefined) dealer.phone = phone;
    if (address !== undefined) dealer.address = address;

    await dealer.save();
    return res.json({ dealer });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteDealer = async (req, res) => {
  try {
    const { businessId, dealerId } = req.params;
    const business = await assertOwnedBusiness(businessId, req.user.user_id);
    if (!business) return res.status(403).json({ message: 'Not authorized.' });

    const dealer = await Supplier.findOne({ where: { supplier_id: dealerId, business_id: businessId } });
    if (!dealer) return res.status(404).json({ message: 'Dealer not found' });

    await dealer.destroy();
    return res.json({ message: 'Dealer deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
