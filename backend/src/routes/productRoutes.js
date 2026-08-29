const express = require('express');
const router = express.Router({ mergeParams: true });
const productController = require('../controllers/productController');

// authMiddleware is already applied by the parent businessRoutes router

router.post('/', productController.addProduct);
router.get('/', productController.getProducts);
router.get('/:productId', productController.getProduct);
router.put('/:productId', productController.updateProduct);
router.delete('/:productId', productController.deleteProduct);

module.exports = router;
