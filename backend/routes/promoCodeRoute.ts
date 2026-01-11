import express from "express";
import { validatePromoCode, applyPromoCode } from "../controllers/promoCodeController";

const promoCodeRouter = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ValidatePromoCodeRequest:
 *       type: object
 *       required:
 *         - code
 *         - orderTotal
 *       properties:
 *         code:
 *           type: string
 *           example: "GAMING30"
 *         orderTotal:
 *           type: number
 *           example: 5000000
 *     PromoCodeResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *             type:
 *               type: string
 *               enum: [percentage, fixed, freeship]
 *             discountAmount:
 *               type: number
 *             isFreeShip:
 *               type: boolean
 *             description:
 *               type: string
 */

/**
 * @swagger
 * /api/promo-code/validate:
 *   post:
 *     summary: Validate promo code
 *     description: Check if a promo code is valid and calculate discount amount
 *     tags: [PromoCode]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ValidatePromoCodeRequest'
 *     responses:
 *       200:
 *         description: Promo code is valid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PromoCodeResponse'
 *       400:
 *         description: Invalid promo code or requirements not met
 *       404:
 *         description: Promo code not found
 *       500:
 *         description: Internal server error
 */
promoCodeRouter.post("/validate", validatePromoCode);

/**
 * @swagger
 * /api/promo-code/apply:
 *   post:
 *     summary: Apply promo code
 *     description: Apply a promo code (increment usage count). Should be called after order is created.
 *     tags: [PromoCode]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Promo code applied successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Promo code not found
 *       500:
 *         description: Internal server error
 */
promoCodeRouter.post("/apply", applyPromoCode);

export default promoCodeRouter;

