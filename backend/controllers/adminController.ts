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
            cancelledOrders,
            returnedOrders,
            revenueByMonth,
            ordersByDay
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
            orderModel.countDocuments({ orderStatus: 'cancelled' }),
            orderModel.countDocuments({ orderStatus: 'returned' }),
            // Revenue by month for last 6 months
            orderModel.aggregate([
                {
                    $match: {
                        orderStatus: { $in: ['delivered', 'shipped'] }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' }
                        },
                        total: { $sum: '$total' }
                    }
                },
                {
                    $sort: {
                        '_id.year': 1,
                        '_id.month': 1
                    }
                }
            ]),
            // Orders per day for last 7 days
            orderModel.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(new Date().setDate(new Date().getDate() - 6))
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' },
                            day: { $dayOfMonth: '$createdAt' }
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: {
                        '_id.year': 1,
                        '_id.month': 1,
                        '_id.day': 1
                    }
                }
            ])
        ]);

        const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

        // Get recent orders with pagination (all orders list)
        const page = parseInt((req.query.page as string) || "1");
        const limit = parseInt((req.query.limit as string) || "10");
        const skip = (page - 1) * limit;

        const [recentOrders, recentTotal] = await Promise.all([
            orderModel
                .find({})
                .populate('userId', 'firstName lastName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select('orderNumber orderStatus total createdAt customerInfo'),
            orderModel.countDocuments({})
        ]);

        const totalPages = Math.ceil(recentTotal / limit);

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
                        cancelled: cancelledOrders,
                        returned: returnedOrders
                    },
                    revenueByMonth,
                    ordersByDay
                },
                recentOrders,
                recentOrdersPagination: {
                    currentPage: page,
                    itemsPerPage: limit,
                    totalItems: recentTotal,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
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

