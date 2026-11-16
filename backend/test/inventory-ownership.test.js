const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Business, Product } = require('../src/models');
const controller = require('../src/controllers/productController');

test('all inventory operations reject another tenant before querying products', async () => {
  const original = Business.findOne;
  const originalFind = Product.findOne;
  Business.findOne = async ({ where }) => {
    assert.deepEqual(where, { business_id: '42', user_id: 7 });
    return null;
  };
  Product.findOne = async () => assert.fail('must not query products for another tenant');
  try {
    for (const operation of ['addProduct', 'getProducts', 'getProduct', 'updateProduct', 'deleteProduct']) {
      let status;
      const req = { params: { businessId: '42', productId: '99' }, user: { user_id: 7 }, body: {}, query: {} };
      const res = { status(code) { status = code; return this; }, json(body) { assert.equal(body.message, 'Business not found.'); } };
      await controller[operation](req, res);
      assert.equal(status, 404);
    }
  } finally { Business.findOne = original; Product.findOne = originalFind; }
});

test('single product reads, updates and deletes constrain the product to its business', async () => {
  const originalBusiness = Business.findOne;
  const originalProduct = Product.findOne;
  Business.findOne = async () => ({ business_id: 42 });
  Product.findOne = async ({ where }) => {
    assert.deepEqual(where, { product_id: '99', business_id: 42 });
    return null;
  };
  try {
    for (const operation of ['getProduct', 'updateProduct', 'deleteProduct']) {
      let status;
      await controller[operation]({ params: { businessId: '42', productId: '99' }, user: { user_id: 7 } }, {
        status(code) { status = code; return this; }, json() {},
      });
      assert.equal(status, 404);
    }
  } finally { Business.findOne = originalBusiness; Product.findOne = originalProduct; }
});
