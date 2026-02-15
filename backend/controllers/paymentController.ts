import type { Request, Response } from "express";
import orderModel from "../models/orderModel";
import { buildVnpParams, buildSignedVnpUrl, verifyVnpReturn } from "../services/vnpayService";
import userModel from "../models/userModel";

// POST /api/payments/vnpay/create
export const createVnpayPayment = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userId = (req as any).userId;
        const { orderId } = req.body as { orderId?: string };

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "orderId is required",
            });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        // Check ownership (non-admin users can only pay their own orders)
        const isOwner = order.userId.toString() === userId.toString();
        const isAdmin = user.role === "admin";
        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        if (order.paymentMethod !== "vnpay") {
            return res.status(400).json({
                success: false,
                message: "Payment method is not VNPay for this order",
            });
        }

        if (order.paymentStatus === "paid") {
            return res.status(400).json({
                success: false,
                message: "Order has already been paid",
            });
        }

        const params = buildVnpParams(order as any, req);
        const hashSecret = (process.env.VNPAY_HASH_SECRET || "").trim();
        const paymentUrl = buildSignedVnpUrl(params, hashSecret);

        // Log for debugging (remove in production or use proper logger)
        console.log("VNPay Payment URL created:", {
            orderId: order._id,
            orderNumber: order.orderNumber,
            amount: order.total,
            vnp_Amount: params.vnp_Amount,
            vnp_TxnRef: params.vnp_TxnRef,
        });

        return res.status(200).json({
            success: true,
            data: {
                paymentUrl,
            },
        });
    } catch (error: any) {
        console.error("Error creating VNPay payment:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create VNPay payment",
            error: error?.message || "Internal server error",
        });
    }
};

// GET /api/payments/vnpay/confirm
export const confirmVnpayPayment = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { isValid, orderRef, transactionNo, responseCode } = verifyVnpReturn(req.query);

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid VNPay signature",
            });
        }

        if (!orderRef) {
            return res.status(400).json({
                success: false,
                message: "Missing order reference",
            });
        }

        // orderRef may be orderNumber or _id
        let order = await orderModel.findOne({ orderNumber: orderRef });
        if (!order) {
            order = await orderModel.findById(orderRef);
        }

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        let paymentStatus: "paid" | "failed" = "failed";
        let message = "Payment failed";

        if (responseCode === "00") {
            // Only set to paid if not already paid
            if (order.paymentStatus !== "paid") {
                order.paymentStatus = "paid";
                order.paymentProvider = "vnpay";
                order.paymentTransactionId = transactionNo || null;
                await order.save();
            }
            paymentStatus = "paid";
            message = "Payment successful";
        } else {
            if (order.paymentStatus !== "paid") {
                order.paymentStatus = "failed";
                order.paymentProvider = "vnpay";
                order.paymentTransactionId = transactionNo || null;
                await order.save();
            }
            paymentStatus = "failed";
            message = "Payment failed or cancelled";
        }

        return res.status(200).json({
            success: paymentStatus === "paid",
            message,
            data: {
                orderId: order._id,
                orderNumber: order.orderNumber,
                paymentStatus: order.paymentStatus,
                paymentProvider: order.paymentProvider,
                paymentTransactionId: order.paymentTransactionId,
                responseCode,
            },
        });
    } catch (error: any) {
        console.error("Error confirming VNPay payment:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to confirm VNPay payment",
            error: error?.message || "Internal server error",
        });
    }
};


