import express from "express";
import { createVnpayPayment, confirmVnpayPayment } from "../controllers/paymentController";
import { verifyToken } from "../middleware/authMiddleware";

const paymentRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment integration endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateVnpayPaymentRequest:
 *       type: object
 *       required:
 *         - orderId
 *       properties:
 *         orderId:
 *           type: string
 *           description: "Order ID to create VNPay payment for"
 *     CreateVnpayPaymentResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             paymentUrl:
 *               type: string
 *               description: "VNPay payment URL to redirect user to"
 *     VnpayConfirmResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             orderId:
 *               type: string
 *             orderNumber:
 *               type: string
 *             paymentStatus:
 *               type: string
 *               enum: [pending, paid, failed, refunded]
 *             paymentProvider:
 *               type: string
 *             paymentTransactionId:
 *               type: string
 *             responseCode:
 *               type: string
 */

/**
 * @swagger
 * /api/payments/vnpay/create:
 *   post:
 *     summary: "Create VNPay payment URL for an order"
 *     description: Generate a VNPay payment URL for a given order (paymentMethod must be 'vnpay').
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateVnpayPaymentRequest'
 *           examples:
 *             default:
 *               value:
 *                 orderId: "65f1234567890abcdef1234"
 *     responses:
 *       200:
 *         description: Payment URL created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateVnpayPaymentResponse'
 *       400:
 *         description: Bad request (missing orderId, wrong paymentMethod, already paid)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (not order owner or admin)
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
paymentRouter.post("/vnpay/create", verifyToken, createVnpayPayment);

/**
 * @swagger
 * /api/payments/vnpay/confirm:
 *   get:
 *     summary: "Confirm VNPay payment result"
 *     description: Verify VNPay return parameters, update order payment status, and return final result.
 *     tags: [Payments]
 *     parameters:
 *       - in: query
 *         name: vnp_Amount
 *         schema:
 *           type: string
 *       - in: query
 *         name: vnp_TxnRef
 *         schema:
 *           type: string
 *       - in: query
 *         name: vnp_ResponseCode
 *         schema:
 *           type: string
 *       - in: query
 *         name: vnp_TransactionNo
 *         schema:
 *           type: string
 *       - in: query
 *         name: vnp_SecureHash
 *         schema:
 *           type: string
 *       - in: query
 *         name: vnp_SecureHashType
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment confirmation processed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VnpayConfirmResponse'
 *       400:
 *         description: Invalid signature or missing data
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
paymentRouter.get("/vnpay/confirm", confirmVnpayPayment);

export default paymentRouter;


