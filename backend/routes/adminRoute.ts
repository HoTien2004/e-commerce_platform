import express from "express";
import { getDashboardStats } from "../controllers/adminController";
import { verifyToken } from "../middleware/authMiddleware";

const adminRouter = express.Router();

/**
 * @swagger
 * /api/admin/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics (admin only)
 *     description: Retrieve statistics including total products, orders, users, revenue, and recent orders.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalProducts:
 *                           type: number
 *                         totalOrders:
 *                           type: number
 *                         totalUsers:
 *                           type: number
 *                         totalRevenue:
 *                           type: number
 *                         ordersByStatus:
 *                           type: object
 *                           properties:
 *                             pending:
 *                               type: number
 *                             shipped:
 *                               type: number
 *                             delivered:
 *                               type: number
 *                             cancelled:
 *                               type: number
 *                     recentOrders:
 *                       type: array
 *                       items:
 *                         type: object
 *       403:
 *         description: Access denied (admin only)
 */
adminRouter.get("/dashboard/stats", verifyToken, getDashboardStats);

export default adminRouter;

