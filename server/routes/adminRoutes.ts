import express from "express"
import { authorized, protect } from "../middleware/auth.js"
import { getDashboardStats } from "../controllers/adminController.js"

const AdminRouter = express.Router()

// get dashboard stats
AdminRouter.get('/stats', protect, authorized('admin'), getDashboardStats)

export default AdminRouter;