import type { Request, Response } from "express";
import promoCodeModel from "../models/promoCodeModel";

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

