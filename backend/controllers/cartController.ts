import type { Request, Response } from "express";
import cartModel from "../models/cartModel";
import userModel from "../models/userModel";
import productModel from "../models/productModel";

// Get user's cart
export const getCart = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userId = (req as any).userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // Find user and populate cart
        const user = await userModel.findById(userId).populate('cartId');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // If user doesn't have a cart, create one
        let cart;
        if (!user.cartId) {
            cart = await cartModel.create({
                userId: user._id,
                items: [],
                total: 0
            });
            user.cartId = cart._id;
            await user.save();
        } else {
            cart = await cartModel.findById(user.cartId).populate('items.productId');
        }

        return res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error: any) {
        console.error("Error getting cart:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Add item to cart
export const addToCart = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userId = (req as any).userId;
        const { productId, quantity = 1 } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        // Verify product exists
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Check stock
        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Xin lỗi, đã hết hàng'
            });
        }

        // Find user
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Get or create cart
        let cart;
        if (!user.cartId) {
            cart = await cartModel.create({
                userId: user._id,
                items: [],
                total: 0
            });
            user.cartId = cart._id;
            await user.save();
        } else {
            cart = await cartModel.findById(user.cartId);
        }

        if (!cart) {
            return res.status(500).json({
                success: false,
                message: "Failed to create or retrieve cart"
            });
        }

        // Check if product already exists in cart
        const existingItemIndex = cart.items.findIndex(
            (item: any) => item.productId.toString() === productId
        );

        if (existingItemIndex !== -1) {
            // Update quantity
            const currentQuantity = cart.items[existingItemIndex].quantity;
            const newQuantity = currentQuantity + quantity;
            if (newQuantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: 'Xin lỗi, đã hết hàng'
                });
            }
            cart.items[existingItemIndex].quantity = newQuantity;
        } else {
            // Add new item
            cart.items.push({
                productId: product._id,
                quantity: quantity,
                price: product.price,
                addedAt: new Date()
            });
        }

        (cart as any).calculateTotal();
        await cart.save();

        // Populate product details
        await cart.populate('items.productId');

        return res.status(200).json({
            success: true,
            message: "Item added to cart successfully",
            data: cart
        });
    } catch (error: any) {
        console.error("Error adding to cart:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Update cart item quantity
export const updateCartItem = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userId = (req as any).userId;
        const { productId, quantity } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        if (!productId || quantity === undefined) {
            return res.status(400).json({
                success: false,
                message: "Product ID and quantity are required"
            });
        }

        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be at least 1"
            });
        }

        // Find user and cart
        const user = await userModel.findById(userId);
        if (!user || !user.cartId) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        const cart = await cartModel.findById(user.cartId);
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        // Find item in cart
        const itemIndex = cart.items.findIndex(
            (item: any) => item.productId.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Item not found in cart"
            });
        }

        // Verify product stock
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: `Insufficient stock. Available: ${product.stock}`
            });
        }

        // Update quantity
        cart.items[itemIndex].quantity = quantity;
        (cart as any).calculateTotal();
        await cart.save();

        // Populate product details
        await cart.populate('items.productId');

        return res.status(200).json({
            success: true,
            message: "Cart item updated successfully",
            data: cart
        });
    } catch (error: any) {
        console.error("Error updating cart item:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Remove item from cart
export const removeFromCart = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userId = (req as any).userId;
        const { productId } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        // Find user and cart
        const user = await userModel.findById(userId);
        if (!user || !user.cartId) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        const cart = await cartModel.findById(user.cartId);
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        // Remove item
        cart.items = cart.items.filter(
            (item: any) => item.productId.toString() !== productId
        );

        (cart as any).calculateTotal();
        await cart.save();

        // Populate product details
        await cart.populate('items.productId');

        return res.status(200).json({
            success: true,
            message: "Item removed from cart successfully",
            data: cart
        });
    } catch (error: any) {
        console.error("Error removing from cart:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Clear cart
export const clearCart = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userId = (req as any).userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // Find user and cart
        const user = await userModel.findById(userId);
        if (!user || !user.cartId) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        const cart = await cartModel.findById(user.cartId);
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        // Clear items
        cart.items = [];
        (cart as any).calculateTotal();
        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
            data: cart
        });
    } catch (error: any) {
        console.error("Error clearing cart:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

