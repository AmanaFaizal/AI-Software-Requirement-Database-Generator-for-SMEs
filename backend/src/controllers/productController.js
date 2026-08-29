const { Op } = require('sequelize');
const { Product, Category } = require('../models');
const { assertOwnedBusiness } = require('./businessController');

// All routes here are nested under /api/businesses/:businessId/products
// so we always confirm the business belongs to the logged-in user first.

async function ensureBusinessAccess(req, res) {
  const business = await assertOwnedBusiness(req.params.businessId, req.user.user_id);
  if (!business) {
    res.status(404).json({ message: 'Business not found.' });
    return null;
  }
  return business;
}

// CREATE
exports.addProduct = async (req, res) => {
  try {
    const business = await ensureBusinessAccess(req, res);
    if (!business) return;

    const { product_name, category_id, quantity, cost_price, selling_price } = req.body;

    if (!product_name) {
      return res.status(400).json({ message: 'product_name is required.' });
    }

    const product = await Product.create({
      business_id: business.business_id,
      product_name,
      category_id,
      quantity: quantity ?? 0,
      cost_price,
      selling_price,
    });

    return res.status(201).json({ message: 'Product added.', product });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while adding product.' });
  }
};

// READ (list, with optional search + pagination)
exports.getProducts = async (req, res) => {
  try {
    const business = await ensureBusinessAccess(req, res);
    if (!business) return;

    const { search, category_id, page = 1, limit = 20 } = req.query;

    const where = { business_id: business.business_id };

    if (search) {
      where.product_name = { [Op.like]: `%${search}%` };
    }
    if (category_id) {
      where.category_id = category_id;
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { rows, count } = await Product.findAndCountAll({
      where,
      include: [
        { model: Category, attributes: ['name'] }
      ],
      order: [['created_at', 'DESC']],
      limit: Number(limit),
      offset,
    });

    return res.json({
      products: rows,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while fetching products.' });
  }
};

// READ (single)
exports.getProduct = async (req, res) => {
  try {
    const business = await ensureBusinessAccess(req, res);
    if (!business) return;

    const product = await Product.findOne({
      where: { product_id: req.params.productId, business_id: business.business_id },
      include: [
        { model: Category, attributes: ['name'] }
      ]
    });
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    return res.json({ product });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while fetching product.' });
  }
};

// UPDATE
exports.updateProduct = async (req, res) => {
  try {
    const business = await ensureBusinessAccess(req, res);
    if (!business) return;

    const product = await Product.findOne({
      where: { product_id: req.params.productId, business_id: business.business_id },
    });
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    const fields = ['product_name', 'category_id', 'quantity', 'cost_price', 'selling_price'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) product[field] = req.body[field];
    });

    await product.save();
    return res.json({ message: 'Product updated.', product });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while updating product.' });
  }
};

// DELETE
exports.deleteProduct = async (req, res) => {
  try {
    const business = await ensureBusinessAccess(req, res);
    if (!business) return;

    const product = await Product.findOne({
      where: { product_id: req.params.productId, business_id: business.business_id },
    });
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    await product.destroy();
    return res.json({ message: 'Product deleted.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while deleting product.' });
  }
};
