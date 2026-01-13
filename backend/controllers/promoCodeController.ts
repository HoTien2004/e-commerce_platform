import type { Request, Response } from "express";
import promoCodeModel from "../models/promoCodeModel";

// List all promo codes (simple admin utility)
export const listPromoCodes = async (_req: Request, res: Response): Promise<Response> => {
    try {
        const promoCodes = await promoCodeModel.find().sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            data: promoCodes
        });
    } catch (error: any) {
        console.error("Error listing promo codes:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Create promo code
export const createPromoCode = async (req: Request, res: Response): Promise<Response> => {
    try {
        const {
            code,
            type,
            value,
            minOrder = 0,
            maxDiscount = null,
            validFrom,
            validTo,
            usageLimit = null,
            isActive = true,
            description = ""
        } = req.body;

        if (!code || !type || value === undefined || !validFrom || !validTo) {
            return res.status(400).json({
                success: false,
                message: "code, type, value, validFrom, validTo are required"
            });
        }

        const existing = await promoCodeModel.findOne({ code: code.toUpperCase().trim() });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Mã khuyến mãi đã tồn tại"
            });
        }

        const promoCode = await promoCodeModel.create({
            code: code.toUpperCase().trim(),
            type,
            value,
            minOrder,
            maxDiscount,
            validFrom: new Date(validFrom),
            validTo: new Date(validTo),
            usageLimit,
            usedCount: 0,
            isActive,
            description
        });

        return res.status(201).json({
            success: true,
            message: "Tạo mã khuyến mãi thành công",
            data: promoCode
        });
    } catch (error: any) {
        console.error("Error creating promo code:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Update promo code
export const updatePromoCode = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const body = req.body || {};

        const promoCode = await promoCodeModel.findById(id);
        if (!promoCode) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy mã khuyến mãi"
            });
        }

        // If code is updated, ensure uniqueness
        if (body.code) {
            const code = body.code.toUpperCase().trim();
            const existing = await promoCodeModel.findOne({ code, _id: { $ne: id } });
            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: "Mã khuyến mãi đã tồn tại"
                });
            }
            promoCode.code = code;
        }

        const fields: Array<keyof typeof promoCode> = [
            "type",
            "value",
            "minOrder",
            "maxDiscount",
            "usageLimit",
            "isActive",
            "description"
        ];
        fields.forEach((field) => {
            if (body[field] !== undefined) {
                // @ts-ignore
                promoCode[field] = body[field];
            }
        });

        if (body.validFrom) promoCode.validFrom = new Date(body.validFrom);
        if (body.validTo) promoCode.validTo = new Date(body.validTo);

        promoCode.updatedAt = new Date();
        await promoCode.save();

        return res.status(200).json({
            success: true,
            message: "Cập nhật mã khuyến mãi thành công",
            data: promoCode
        });
    } catch (error: any) {
        console.error("Error updating promo code:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Delete promo code
export const deletePromoCode = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const promoCode = await promoCodeModel.findById(id);
        if (!promoCode) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy mã khuyến mãi"
            });
        }

        await promoCode.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Đã xóa mã khuyến mãi"
        });
    } catch (error: any) {
        console.error("Error deleting promo code:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Validate promo code
export const validatePromoCode = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { code, orderTotal } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: "Mã khuyến mãi không được để trống"
            });
        }

        const promoCode = await promoCodeModel.findOne({
            code: code.toUpperCase().trim(),
            isActive: true
        });

        if (!promoCode) {
            return res.status(404).json({
                success: false,
                message: "Mã khuyến mãi không tồn tại hoặc không còn hiệu lực"
            });
        }

        const orderTotalNum = parseFloat(orderTotal) || 0;
        const validation = (promoCode as any).isValid(orderTotalNum);

        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.message
            });
        }

        const discountAmount = (promoCode as any).calculateDiscount(orderTotalNum);
        const isFreeShip = promoCode.type === "freeship";

        return res.status(200).json({
            success: true,
            data: {
                code: promoCode.code,
                type: promoCode.type,
                discountAmount,
                isFreeShip,
                description: promoCode.description
            }
        });
    } catch (error: any) {
        console.error("Error validating promo code:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Apply promo code (increment used count)
export const applyPromoCode = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: "Mã khuyến mãi không được để trống"
            });
        }

        const promoCode = await promoCodeModel.findOne({
            code: code.toUpperCase().trim(),
            isActive: true
        });

        if (!promoCode) {
            return res.status(404).json({
                success: false,
                message: "Mã khuyến mãi không tồn tại"
            });
        }

        // Increment used count
        promoCode.usedCount += 1;
        await promoCode.save();

        return res.status(200).json({
            success: true,
            message: "Mã khuyến mãi đã được áp dụng"
        });
    } catch (error: any) {
        console.error("Error applying promo code:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

