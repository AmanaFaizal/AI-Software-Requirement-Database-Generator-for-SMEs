const { Category, Business } = require('../models');
const { assertOwnedBusiness } = require('./businessController');

exports.getCategories = async (req, res) => {
  try {
    const { businessId } = req.params;
    const business = await assertOwnedBusiness(businessId, req.user.user_id);
    if (!business) return res.status(403).json({ message: 'Not authorized.' });

    const categories = await Category.findAll({ where: { business_id: businessId } });
    return res.json({ categories });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { businessId } = req.params;
    const business = await assertOwnedBusiness(businessId, req.user.user_id);
    if (!business) return res.status(403).json({ message: 'Not authorized.' });

    // Handle bulk creation if array is provided
    if (Array.isArray(req.body.names)) {
      const { names } = req.body;
      const categories = await Promise.all(names.map(name => 
        Category.create({ business_id: businessId, name: name.trim() })
      ));
      return res.status(201).json({ categories });
    }

    // Fallback to single creation
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name required' });

    const category = await Category.create({ business_id: businessId, name });
    return res.status(201).json({ category });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { businessId, categoryId } = req.params;
    const business = await assertOwnedBusiness(businessId, req.user.user_id);
    if (!business) return res.status(403).json({ message: 'Not authorized.' });

    const category = await Category.findOne({ where: { category_id: categoryId, business_id: businessId } });
    if (!category) return res.status(404).json({ message: 'Category not found' });

    const { name, description } = req.body;
    if (name) category.name = name;
    if (description !== undefined) category.description = description;

    await category.save();
    return res.json({ category });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { businessId, categoryId } = req.params;
    const business = await assertOwnedBusiness(businessId, req.user.user_id);
    if (!business) return res.status(403).json({ message: 'Not authorized.' });

    const category = await Category.findOne({ where: { category_id: categoryId, business_id: businessId } });
    if (!category) return res.status(404).json({ message: 'Category not found' });

    await category.destroy();
    return res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
