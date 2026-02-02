import type { Request, Response } from "express";
import orderModel from "../models/orderModel";
import cartModel from "../models/cartModel";
import userModel from "../models/userModel";
import productModel from "../models/productModel";
import promoCodeModel from "../models/promoCodeModel";

// Create new order
const createOrder = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userId = (req as any).userId;
        const { shippingAddress, paymentMethod = 'cod', promoCode, notes, selectedProductIds, customerInfo } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        if (!shippingAddress || !shippingAddress.trim()) {
            return res.status(400).json({
                success: false,
                message: "Shipping address is required"
            });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.cartId) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            });
        }

        const cart = await cartModel.findById(user.cartId).populate('items.productId');
        if (!cart || !cart.items || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            });
        }

        let cartItemsToProcess = cart.items;
        if (selectedProductIds && Array.isArray(selectedProductIds) && selectedProductIds.length > 0) {
            cartItemsToProcess = cart.items.filter((item: any) => {
                const productId = item.productId._id?.toString() || item.productId.toString();
                return selectedProductIds.includes(productId);
            });
            
            if (cartItemsToProcess.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "No selected items found in cart"
                });
            }
        }

        const orderItems: any[] = [];
        let subtotal = 0;

        for (const cartItem of cartItemsToProcess) {
            const product = await productModel.findById((cartItem as any).productId._id || (cartItem as any).productId);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${(cartItem as any).productId._id || (cartItem as any).productId}`
                });
            }

            if (product.status !== 'active') {
                return res.status(400).json({
                    success: false,
                    message: `Product ${product.name} is not available`
                });
            }

            if (product.stock < (cartItem as any).quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${(cartItem as any).quantity}`
                });
            }

            const itemPrice = (cartItem as any).price;
            const itemQuantity = (cartItem as any).quantity;
            const itemTotal = itemPrice * itemQuantity;
            subtotal += itemTotal;

            orderItems.push({
                productId: product._id,
                quantity: itemQuantity,
                price: itemPrice,
                name: product.name
            });
        }

        // Calculate shipping fee (free if order > 1,000,000₫, otherwise 50,000₫)
        const shippingFee = subtotal > 1000000 ? 0 : 50000;

        // Validate and apply promo code if provided
        let discount = 0;
        let appliedPromoCode = null;
        let isFreeShip = false;

        if (promoCode && promoCode.trim()) {
            const promo = await promoCodeModel.findOne({ code: promoCode.trim().toUpperCase() });
            if (!promo) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid promo code"
                });
            }

            // Validate promo code using model method
            const validation = (promo as any).isValid(subtotal);
            if (!validation.valid) {
                return res.status(400).json({
                    success: false,
                    message: validation.message || "Invalid promo code"
                });
            }

            // Calculate discount using model method
            discount = (promo as any).calculateDiscount(subtotal);
            isFreeShip = promo.type === 'freeship';
            appliedPromoCode = promo.code;
        }

        const finalShippingFee = (isFreeShip || subtotal > 1000000) ? 0 : shippingFee;
        
        const total = Math.max(0, subtotal - discount + finalShippingFee);

        const bodyFullName = (customerInfo?.fullName || '').trim();
        const bodyPhone = (customerInfo?.phone || '').trim();
        const bodyEmail = (customerInfo?.email || '').trim();

        const finalPhone = bodyPhone || (user.phone || '').trim();
        if (!finalPhone) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required"
            });
        }

        if (!user.phone || user.phone.trim() === '') {
            user.phone = finalPhone;
            await user.save();
        }

        const finalFullName = bodyFullName || `${user.firstName} ${user.lastName}`;
        const finalEmail = bodyEmail || user.email;

        const order = await orderModel.create({
            userId: user._id,
            items: orderItems,
            shippingAddress: shippingAddress.trim(),
            shippingFee: finalShippingFee,
            subtotal: subtotal,
            discount: discount,
            total: total,
            paymentMethod: paymentMethod,
            orderStatus: 'pending',
            promoCode: appliedPromoCode,
            notes: notes || null,
            customerInfo: {
                fullName: finalFullName,
                phone: finalPhone,
                email: finalEmail
            }
        });

        // Update product stock
        for (const item of orderItems) {
            await productModel.findByIdAndUpdate(item.productId, {
                $inc: { stock: -item.quantity }
            });
        }

        // Increment promo code usage if applied
        if (appliedPromoCode) {
            await promoCodeModel.findOneAndUpdate(
                { code: appliedPromoCode },
                { $inc: { usedCount: 1 } }
            );
        }

        // Remove only ordered items from cart (not all items)
        if (selectedProductIds && Array.isArray(selectedProductIds) && selectedProductIds.length > 0) {
            // Remove only selected items - need to compare productId correctly
            const selectedIdsAsStrings = selectedProductIds.map(id => id.toString());
            cart.items = cart.items.filter((item: any) => {
                // Handle both populated and non-populated productId
                let itemProductId: string;
                if (item.productId && typeof item.productId === 'object' && item.productId._id) {
                    // Populated productId
                    itemProductId = item.productId._id.toString();
                } else if (item.productId) {
                    // Non-populated productId (ObjectId or string)
                    itemProductId = item.productId.toString();
                } else {
                    return true; // Keep item if productId is missing (shouldn't happen)
                }
                // Keep items that are NOT in selectedProductIds
                return !selectedIdsAsStrings.includes(itemProductId);
            });
        } else {
            // If no selectedProductIds provided, clear all (backward compatibility)
            cart.items = [];
        }
        (cart as any).calculateTotal();
        await cart.save();

        // Populate order for response
        const populatedOrder = await orderModel.findById(order._id)
            .populate('userId', 'firstName lastName email phone')
            .populate('items.productId', 'name images');

        return res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: {
                order: populatedOrder
            }
        });

    } catch (error: any) {
        console.error("Error creating order:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get user's orders (or all orders if admin)
const getOrders = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userId = (req as any).userId;
        const { page = 1, limit = 10, status, orderNumber, email } = req.query;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // Check if user is admin
        const user = await userModel.findById(userId);
        const isAdmin = user?.role === 'admin';

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        // Build query
        const query: any = {};
        
        // If not admin, only show user's own orders
        if (!isAdmin) {
            query.userId = userId;
        }
        
        // Filter by status
        if (status && ['pending', 'shipped', 'delivered', 'cancelled', 'returned'].includes(status as string)) {
            query.orderStatus = status;
        }
        
        // Admin filters
        if (isAdmin) {
            if (orderNumber) {
                query.orderNumber = { $regex: orderNumber as string, $options: 'i' };
            }
            if (email) {
                // Find user by email and filter orders
                const userByEmail = await userModel.findOne({ email: email as string });
                if (userByEmail) {
                    query.userId = userByEmail._id;
                } else {
                    // If user not found, return empty result
                    return res.status(200).json({
                        success: true,
                        data: {
                            orders: [],
                            pagination: {
                                currentPage: pageNum,
                                itemsPerPage: limitNum,
                                totalItems: 0,
                                totalPages: 0,
                                hasNextPage: false,
                                hasPrevPage: false
                            }
                        }
                    });
                }
            }
        }

        // Get orders with pagination
        const populateOptions = isAdmin 
            ? [
                { path: 'userId', select: 'firstName lastName email phone' },
                { path: 'items.productId', select: 'name images' }
            ]
            : [{ path: 'items.productId', select: 'name images' }];
        
        const orders = await orderModel
            .find(query)
            .populate(populateOptions)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await orderModel.countDocuments(query);
        const totalPages = Math.ceil(total / limitNum);

        return res.status(200).json({
            success: true,
            data: {
                orders: orders,
                pagination: {
                    currentPage: pageNum,
                    itemsPerPage: limitNum,
                    totalItems: total,
                    totalPages: totalPages,
                    hasNextPage: pageNum < totalPages,
                    hasPrevPage: pageNum > 1
                }
            }
        });

    } catch (error: any) {
        console.error("Error getting orders:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get order by ID
const getOrderById = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userId = (req as any).userId;
        const { orderId } = req.params;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // Try to find order by ID (ObjectId) or orderNumber (string)
        let order;
        // Check if orderId is a valid ObjectId format
        if (orderId.match(/^[0-9a-fA-F]{24}$/)) {
            order = await orderModel.findById(orderId);
        } else {
            // If not ObjectId, treat as orderNumber
            order = await orderModel.findOne({ orderNumber: orderId });
        }

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Check if user owns this order or is admin (before populate)
        const user = await userModel.findById(userId);
        const orderUserId = order.userId.toString();
        const currentUserId = userId.toString();
        
        if (orderUserId !== currentUserId && user?.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        // Now populate for response
        const populatedOrder = await orderModel
            .findById(order._id)
            .populate('userId', 'firstName lastName email phone')
            .populate('items.productId', 'name images price stock');

        return res.status(200).json({
            success: true,
            data: {
                order: populatedOrder
            }
        });

    } catch (error: any) {
        console.error("Error getting order:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Update order status (admin only)
const updateOrderStatus = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userId = (req as any).userId;
        const { orderId } = req.params;
        const { orderStatus } = req.body;

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

        // Validate order status
        const validStatuses = ['pending', 'shipped', 'delivered', 'cancelled', 'returned'];
        if (!orderStatus || !validStatuses.includes(orderStatus)) {
            return res.status(400).json({
                success: false,
                message: `Invalid order status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        // Try to find order by ID (ObjectId) or orderNumber (string)
        let order;
        // Check if orderId is a valid ObjectId format
        if (orderId.match(/^[0-9a-fA-F]{24}$/)) {
            order = await orderModel.findById(orderId);
        } else {
            // If not ObjectId, treat as orderNumber
            order = await orderModel.findOne({ orderNumber: orderId });
        }

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Prevent changing status FROM cancelled or returned (but allow changing TO these statuses)
        if ((order.orderStatus === 'cancelled' || order.orderStatus === 'returned') && 
            orderStatus !== order.orderStatus) {
            return res.status(400).json({
                success: false,
                message: `Cannot change status of ${order.orderStatus} order`
            });
        }

        // Update order status
        order.orderStatus = orderStatus;
        await order.save();

        const populatedOrder = await orderModel.findById(order._id)
            .populate('userId', 'firstName lastName email phone')
            .populate('items.productId', 'name images');

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            data: {
                order: populatedOrder
            }
        });

    } catch (error: any) {
        console.error("Error updating order status:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Cancel order (user can cancel pending orders, admin can cancel any)
const cancelOrder = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userId = (req as any).userId;
        const { orderId } = req.params;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Check if user owns this order or is admin
        const user = await userModel.findById(userId);
        if (order.userId.toString() !== userId && user?.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        // User can only cancel pending orders
        if (user?.role !== 'admin' && order.orderStatus !== 'pending') {
            return res.status(400).json({
                success: false,
                message: "Only pending orders can be cancelled by user"
            });
        }

        // Prevent cancelling already cancelled or returned orders
        if (order.orderStatus === 'cancelled' || order.orderStatus === 'returned') {
            return res.status(400).json({
                success: false,
                message: `Order is already ${order.orderStatus}`
            });
        }

        // Restore product stock
        for (const item of order.items) {
            await productModel.findByIdAndUpdate(item.productId, {
                $inc: { stock: item.quantity }
            });
        }

        // Decrement promo code usage if applied
        if (order.promoCode) {
            await promoCodeModel.findOneAndUpdate(
                { code: order.promoCode },
                { $inc: { usedCount: -1 } }
            );
        }

        // Update order status
        order.orderStatus = 'cancelled';
        await order.save();

        const populatedOrder = await orderModel.findById(order._id)
            .populate('userId', 'firstName lastName email phone')
            .populate('items.productId', 'name images');

        return res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
            data: {
                order: populatedOrder
            }
        });

    } catch (error: any) {
        console.error("Error cancelling order:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

export {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder
};

