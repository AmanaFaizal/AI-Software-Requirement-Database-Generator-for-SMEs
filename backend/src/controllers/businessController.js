const { Business } = require('../models');

// Create a new business owned by the logged-in user
exports.createBusiness = async (req, res) => {
  try {
    const { business_name, business_type } = req.body;

    if (!business_name) {
      return res.status(400).json({ message: 'business_name is required.' });
    }

    const business = await Business.create({
      user_id: req.user.user_id,
      business_name,
      business_type,
    });

    return res.status(201).json({ message: 'Business created.', business });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while creating business.' });
  }
};

// List all businesses owned by the logged-in user
exports.getMyBusinesses = async (req, res) => {
  try {
    const businesses = await Business.findAll({
      where: { user_id: req.user.user_id },
      order: [['created_at', 'DESC']],
    });
    return res.json({ businesses });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while fetching businesses.' });
  }
};

// Get one business (must belong to the logged-in user)
exports.getBusiness = async (req, res) => {
  try {
    const business = await Business.findOne({
      where: { business_id: req.params.businessId, user_id: req.user.user_id },
    });
    if (!business) return res.status(404).json({ message: 'Business not found.' });
    return res.json({ business });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while fetching business.' });
  }
};

exports.updateBusiness = async (req, res) => {
  try {
    const business = await Business.findOne({
      where: { business_id: req.params.businessId, user_id: req.user.user_id },
    });
    if (!business) return res.status(404).json({ message: 'Business not found.' });

    const { business_name, business_type } = req.body;
    if (business_name !== undefined) business.business_name = business_name;
    if (business_type !== undefined) business.business_type = business_type;
    await business.save();

    return res.json({ message: 'Business updated.', business });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while updating business.' });
  }
};

exports.deleteBusiness = async (req, res) => {
  try {
    const business = await Business.findOne({
      where: { business_id: req.params.businessId, user_id: req.user.user_id },
    });
    if (!business) return res.status(404).json({ message: 'Business not found.' });

    await business.destroy();
    return res.json({ message: 'Business deleted.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while deleting business.' });
  }
};

// Shared helper used by other controllers to confirm business ownership
exports.assertOwnedBusiness = async (businessId, userId) => {
  return Business.findOne({ where: { business_id: businessId, user_id: userId } });
};
