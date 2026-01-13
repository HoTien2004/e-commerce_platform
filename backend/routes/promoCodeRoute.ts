import express from "express";
import {
    validatePromoCode,
    applyPromoCode,
    listPromoCodes,
    createPromoCode,
    updatePromoCode,
    deletePromoCode
} from "../controllers/promoCodeController";

const promoCodeRouter = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     PromoCode:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         code:
 *           type: string
 *           example: "SUMMER20"
 *         type:
 *           type: string
 *           enum: [percentage, fixed, freeship]
 *         value:
 *           type: number
 *           example: 20
 *         minOrder:
 *           type: number
 *           example: 1000000
 *         maxDiscount:
 *           type: number
 *           nullable: true
 *           example: 500000
 *         validFrom:
 *           type: string
 *           format: date-time
 *         validTo:
 *           type: string
 *           format: date-time
 *         usageLimit:
 *           type: number
 *           nullable: true
 *         usedCount:
 *           type: number
 *         isActive:
 *           type: boolean
 *         description:
 *           type: string
 *     CreatePromoCodeRequest:
 *       type: object
 *       required:
 *         - code
 *         - type
 *         - value
 *         - validFrom
 *         - validTo
 *       properties:
 *         code:
 *           type: string
 *           example: "FREESHIP50"
 *         type:
 *           type: string
 *           enum: [percentage, fixed, freeship]
 *         value:
 *           type: number
 *           example: 50
 *         minOrder:
 *           type: number
 *           example: 300000
 *         maxDiscount:
 *           type: number
 *           nullable: true
 *           example: 150000
 *         validFrom:
 *           type: string
 *           format: date-time
 *         validTo:
 *           type: string
 *           format: date-time
 *         usageLimit:
 *           type: number
 *           nullable: true
 *           example: 100
 *         isActive:
 *           type: boolean
 *           example: true
 *         description:
 *           type: string
 *           example: "Free shipping up to 150k for orders above 300k"
 *     UpdatePromoCodeRequest:
 *       allOf:
 *         - $ref: '#/components/schemas/CreatePromoCodeRequest'
 *       description: All fields optional; supply only fields to update.
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
 * /api/promo-code:
 *   get:
 *     summary: List promo codes
 *     description: Retrieve all promo codes (admin utility).
 *     tags: [PromoCode]
 *     responses:
 *       200:
 *         description: List of promo codes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PromoCode'
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create promo code
 *     tags: [PromoCode]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePromoCodeRequest'
 *     responses:
 *       201:
 *         description: Promo code created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PromoCode'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
promoCodeRouter.get("/", listPromoCodes);
promoCodeRouter.post("/", createPromoCode);

/**
 * @swagger
 * /api/promo-code/{id}:
 *   put:
 *     summary: Update promo code
 *     tags: [PromoCode]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePromoCodeRequest'
 *     responses:
 *       200:
 *         description: Promo code updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Promo code not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete promo code
 *     tags: [PromoCode]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Promo code deleted
 *       404:
 *         description: Promo code not found
 *       500:
 *         description: Internal server error
 */
promoCodeRouter.put("/:id", updatePromoCode);
promoCodeRouter.delete("/:id", deletePromoCode);

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

