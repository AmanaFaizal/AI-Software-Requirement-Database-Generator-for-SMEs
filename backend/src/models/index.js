const sequelize = require('../config/db');

const User = require('./user');
const Business = require('./business');
const Product = require('./product');
const Supplier = require('./supplier');
const Customer = require('./customer');
const Purchase = require('./purchase');
const PurchaseItem = require('./purchaseItem');
const Sale = require('./sale');
const SaleItem = require('./saleItem');
const Note = require('./note');
const Reminder = require('./reminder');
const Category = require('./Category');
const Invoice = require('./Invoice');
const Expense = require('./Expense');

// User -> Businesses (1:M)
User.hasMany(Business, { foreignKey: 'user_id' });
Business.belongsTo(User, { foreignKey: 'user_id' });

// Business -> Products / Suppliers / Customers / Notes / Reminders (1:M)
Business.hasMany(Product, { foreignKey: 'business_id' });
Product.belongsTo(Business, { foreignKey: 'business_id' });

Business.hasMany(Supplier, { foreignKey: 'business_id' });
Supplier.belongsTo(Business, { foreignKey: 'business_id' });

Business.hasMany(Customer, { foreignKey: 'business_id' });
Customer.belongsTo(Business, { foreignKey: 'business_id' });

Business.hasMany(Note, { foreignKey: 'business_id' });
Note.belongsTo(Business, { foreignKey: 'business_id' });

Business.hasMany(Reminder, { foreignKey: 'business_id' });
Reminder.belongsTo(Business, { foreignKey: 'business_id' });

// Purchases
Business.hasMany(Purchase, { foreignKey: 'business_id' });
Purchase.belongsTo(Business, { foreignKey: 'business_id' });

Supplier.hasMany(Purchase, { foreignKey: 'supplier_id' });
Purchase.belongsTo(Supplier, { foreignKey: 'supplier_id' });

Purchase.hasMany(PurchaseItem, { foreignKey: 'purchase_id' });
PurchaseItem.belongsTo(Purchase, { foreignKey: 'purchase_id' });

Product.hasMany(PurchaseItem, { foreignKey: 'product_id' });
PurchaseItem.belongsTo(Product, { foreignKey: 'product_id' });

// Sales
Business.hasMany(Sale, { foreignKey: 'business_id' });
Sale.belongsTo(Business, { foreignKey: 'business_id' });

Customer.hasMany(Sale, { foreignKey: 'customer_id' });
Sale.belongsTo(Customer, { foreignKey: 'customer_id' });

Sale.hasMany(SaleItem, { foreignKey: 'sale_id' });
SaleItem.belongsTo(Sale, { foreignKey: 'sale_id' });

Product.hasMany(SaleItem, { foreignKey: 'product_id' });
SaleItem.belongsTo(Product, { foreignKey: 'product_id' });

// Categories
Business.hasMany(Category, { foreignKey: 'business_id' });
Category.belongsTo(Business, { foreignKey: 'business_id' });

Category.hasMany(Product, { foreignKey: 'category_id' });
Product.belongsTo(Category, { foreignKey: 'category_id' });

// Invoices
Business.hasMany(Invoice, { foreignKey: 'business_id' });
Invoice.belongsTo(Business, { foreignKey: 'business_id' });

Purchase.hasMany(Invoice, { foreignKey: 'purchase_id' });
Invoice.belongsTo(Purchase, { foreignKey: 'purchase_id' });

Sale.hasMany(Invoice, { foreignKey: 'sale_id' });
Invoice.belongsTo(Sale, { foreignKey: 'sale_id' });

// Expenses
Business.hasMany(Expense, { foreignKey: 'business_id' });
Expense.belongsTo(Business, { foreignKey: 'business_id' });

module.exports = {
  sequelize,
  User,
  Business,
  Product,
  Supplier,
  Customer,
  Purchase,
  PurchaseItem,
  Sale,
  SaleItem,
  Note,
  Reminder,
  Category,
  Invoice,
  Expense,
};
