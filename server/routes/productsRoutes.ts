import express from 'express'
import { createProduct, deleteProduct, getProduct, getProducts, updateProduct } from '../controllers/productController.js'
import upload from '../middleware/upload.js'
import { authorized, protect } from '../middleware/auth.js'


const ProductRouter = express.Router()

// get all products
ProductRouter.get('/', getProducts)

// get single product
ProductRouter.get('/:id', getProduct)

// create product (admin only)
ProductRouter.post('/', upload.array('images', 5), protect, authorized('admin'), createProduct)

// update product (admin only)
ProductRouter.put('/:id', upload.array('images', 5), protect, authorized('admin'), updateProduct)

// delete product (admin only)
ProductRouter.delete('/:id', protect, authorized('admin'), deleteProduct)

export default ProductRouter;