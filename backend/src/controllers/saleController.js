const { Sale, Product, Invoice, sequelize } = require('../models');
const { assertOwnedBusiness } = require('./businessController');

exports.getSales = async (req, res) => {
  try {
    const { businessId } = req.params;
    const business = await assertOwnedBusiness(businessId, req.user.user_id);
    if (!business) return res.status(403).json({ message: 'Not authorized.' });

    const sales = await Sale.findAll({ where: { business_id: businessId } });
    return res.json({ sales });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.createSale = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { businessId } = req.params;
    const business = await assertOwnedBusiness(businessId, req.user.user_id);
    if (!business) return res.status(403).json({ message: 'Not authorized.' });

    const { product_id, quantity, customer_id, sale_date } = req.body;
    
    // Check product
    const product = await Product.findOne({ where: { product_id, business_id: businessId }, transaction });
    if (!product) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.quantity < quantity) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Not enough stock' });
    }

    const total_amount = product.selling_price * quantity;

    // Deduct stock
    product.quantity -= quantity;
    await product.save({ transaction });

    // Create Sale
    const sale = await Sale.create({
      business_id: businessId,
      customer_id,
      sale_date: sale_date || new Date(),
      total_amount,
    }, { transaction });
    
    // Auto generate invoice
    const invoice = await Invoice.create({
      business_id: businessId,
      sale_id: sale.sale_id,
      amount: total_amount,
      invoice_number: `INV-SAL-${sale.sale_id}`,
    }, { transaction });

    await transaction.commit();
    return res.status(201).json({ sale, invoice });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
