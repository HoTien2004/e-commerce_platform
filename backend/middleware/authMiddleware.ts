import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

// Middleware to verify access token
export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                success: false,
                message: "Token không được cung cấp"
            });
            return;
        }

        const token = authHeader.substring(7); // Remove "Bearer " prefix

        // Verify token
        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (error: any) {
            if (error.name === "TokenExpiredError") {
                res.status(401).json({
                    success: false,
                    message: "Token đã hết hạn",
                    expired: true
                });
                return;
            }
            res.status(401).json({
                success: false,
                message: "Token không hợp lệ"
            });
            return;
        }

        // Attach user ID to request
        (req as any).userId = decoded.id;
        next();

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi xác thực token"
        });
    }
};

// Helper function to wrap async middleware
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Middleware to verify admin role
const verifyAdminAsync = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // First verify token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
            success: false,
            message: "Token không được cung cấp"
        });
        return;
    }

    const token = authHeader.substring(7);

    // Verify token
    let decoded: any;
    try {
        decoded = jwt.verify(token, JWT_SECRET);
    } catch (error: any) {
        if (error.name === "TokenExpiredError") {
            res.status(401).json({
                success: false,
                message: "Token đã hết hạn",
                expired: true
            });
            return;
        }
        res.status(401).json({
            success: false,
            message: "Token không hợp lệ"
        });
        return;
    }

    // Get user from database to check role
    const user = await (userModel as any).findOne({ _id: decoded.id });
    if (!user) {
        res.status(404).json({
            success: false,
            message: "Không tìm thấy người dùng"
        });
        return;
    }

    // Check if user is admin
    if (user.role !== "admin") {
        res.status(403).json({
            success: false,
            message: "Bạn không có quyền truy cập. Chỉ admin mới có thể thực hiện thao tác này."
        });
        return;
    }

    // Attach user ID to request
    (req as any).userId = decoded.id;
    (req as any).userRole = user.role;
    next();
};

export const verifyAdmin = asyncHandler(verifyAdminAsync);

