import express from "express"
import { authorized, protect } from "../middleware/auth.js"
import { createOrder, getAllOrders, getOrder, getOrders, updateOrderStatus } from "../controllers/ordersController.js"

const OrderRouter = express.Router()

// get user orders
OrderRouter.get('/', protect, getOrders)

// get single order
OrderRouter.get('/:id', protect, getOrder)

// create order from cart
OrderRouter.post('/', protect, createOrder)

// update order status admin only
OrderRouter.put('/:id/status', protect, authorized("admin"), updateOrderStatus)

// get all orders for admin
OrderRouter.get('/admin/all', protect, authorized("admin"), getAllOrders)


export default OrderRouter;