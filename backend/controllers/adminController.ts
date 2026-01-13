import type { Request, Response } from "express";
import userModel from "../models/userModel";
import productModel from "../models/productModel";
import orderModel from "../models/orderModel";

// Get dashboard statistics (admin only)
export const getDashboardStats = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userId = (req as any).userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // Check if user is admin
        const user = await userModel.findById(userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin only."
            });
        }

        // Get statistics
        const [
            totalProducts,
            totalOrders,
            totalUsers,
            totalRevenue,
            pendingOrders,
            shippedOrders,
            deliveredOrders,
            cancelledOrders
        ] = await Promise.all([
            productModel.countDocuments({}),
            orderModel.countDocuments({}),
            userModel.countDocuments({ role: 'user' }),
            orderModel.aggregate([
                {
                    $match: {
                        orderStatus: { $in: ['delivered', 'shipped'] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$total' }
                    }
                }
            ]),
            orderModel.countDocuments({ orderStatus: 'pending' }),
            orderModel.countDocuments({ orderStatus: 'shipped' }),
            orderModel.countDocuments({ orderStatus: 'delivered' }),
            orderModel.countDocuments({ orderStatus: 'cancelled' })
        ]);

        const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

        // Get recent orders (last 10)
        const recentOrders = await orderModel
            .find({})
            .populate('userId', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .limit(10)
            .select('orderNumber orderStatus total createdAt customerInfo');

        return res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalProducts,
                    totalOrders,
                    totalUsers,
                    totalRevenue: revenue,
                    ordersByStatus: {
                        pending: pendingOrders,
                        shipped: shippedOrders,
                        delivered: deliveredOrders,
                        cancelled: cancelledOrders
                    }
                },
                recentOrders
            }
        });

    } catch (error: any) {
        console.error("Error getting dashboard stats:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

