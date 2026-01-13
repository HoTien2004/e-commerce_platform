import express from "express";
import { createOrder, getOrders, getOrderById, updateOrderStatus, cancelOrder } from "../controllers/orderController";
import { verifyToken } from "../middleware/authMiddleware";

const orderRouter = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       properties:
 *         productId:
 *           type: string
 *         quantity:
 *           type: number
 *         price:
 *           type: number
 *         name:
 *           type: string
 *     Order:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         orderNumber:
 *           type: string
 *         userId:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         shippingAddress:
 *           type: string
 *         shippingFee:
 *           type: number
 *         subtotal:
 *           type: number
 *         discount:
 *           type: number
 *         total:
 *           type: number
 *         paymentMethod:
 *           type: string
 *           enum: [cod, bank, momo]
 *         orderStatus:
 *           type: string
 *           enum: [pending, shipped, delivered, cancelled, returned]
 *         promoCode:
 *           type: string
 *         notes:
 *           type: string
 *         customerInfo:
 *           type: object
 *           properties:
 *             fullName:
 *               type: string
 *             phone:
 *               type: string
 *             email:
 *               type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateOrderRequest:
 *       type: object
 *       required:
 *         - shippingAddress
 *       properties:
 *         shippingAddress:
 *           type: string
 *           description: "Shipping address"
 *         paymentMethod:
 *           type: string
 *           enum: [cod, bank, momo]
 *           default: cod
 *         promoCode:
 *           type: string
 *           description: "Optional promo code"
 *         notes:
 *           type: string
 *           description: "Optional order notes"
 *     UpdateOrderStatusRequest:
 *       type: object
 *       required:
 *         - orderStatus
 *       properties:
 *         orderStatus:
 *           type: string
 *           enum: [pending, shipped, delivered, cancelled, returned]
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: "Create new order"
 *     description: Create a new order from user's cart. Cart will be cleared after order creation. Product stock will be updated.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *           examples:
 *             default:
 *               value:
 *                 shippingAddress: "123 Main Street, Ho Chi Minh City"
 *                 paymentMethod: "cod"
 *                 promoCode: "FREESHIP10"
 *                 notes: "Please deliver in the morning"
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Order created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad request (empty cart, invalid promo code, insufficient stock)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
orderRouter.post("/", verifyToken, createOrder);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: "Get user's orders"
 *     description: Get list of orders for the current user with pagination and optional status filter
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: "Page number"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: "Items per page"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, shipped, delivered, cancelled, returned]
 *         description: "Filter by order status"
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     orders:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Order'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: number
 *                         itemsPerPage:
 *                           type: number
 *                         totalItems:
 *                           type: number
 *                         totalPages:
 *                           type: number
 *                         hasNextPage:
 *                           type: boolean
 *                         hasPrevPage:
 *                           type: boolean
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
orderRouter.get("/", verifyToken, getOrders);

/**
 * @swagger
 * /api/orders/{orderId}:
 *   get:
 *     summary: "Get order by ID or order number"
 *     description: Get detailed information of a specific order. Can use either MongoDB ObjectId or orderNumber. User can only view their own orders, admin can view any order.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: "Order ID (ObjectId) or Order Number (e.g., TS-20240101-120000-1234)"
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (not order owner or admin)
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
orderRouter.get("/:orderId", verifyToken, getOrderById);

/**
 * @swagger
 * /api/orders/{orderId}/status:
 *   put:
 *     summary: "Update order status (Admin only)"
 *     description: Update the status of an order. Only admin can perform this action. Cannot change status of cancelled or returned orders.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: "Order ID"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOrderStatusRequest'
 *           examples:
 *             shipped:
 *               value:
 *                 orderStatus: "shipped"
 *             delivered:
 *               value:
 *                 orderStatus: "delivered"
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Order status updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad request (invalid status, cannot change cancelled/returned order)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (admin only)
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
orderRouter.put("/:orderId/status", verifyToken, updateOrderStatus);

/**
 * @swagger
 * /api/orders/{orderId}/cancel:
 *   put:
 *     summary: "Cancel order"
 *     description: Cancel an order. User can only cancel pending orders. Admin can cancel any order. Product stock will be restored and promo code usage will be decremented.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: "Order ID"
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Order cancelled successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad request (order already cancelled/returned, user trying to cancel non-pending order)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (not order owner or admin)
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
orderRouter.put("/:orderId/cancel", verifyToken, cancelOrder);

export default orderRouter;

