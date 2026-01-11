import express from "express";
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImages,
    getCategories,
    getBrands,
    getFeaturedProducts,
    getBestSellers,
    bulkCreateProducts
} from "../controllers/productController";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware";
import { upload } from "../middleware/uploadMiddleware";

const productRouter = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ProductImage:
 *       type: object
 *       properties:
 *         url:
 *           type: string
 *         publicId:
 *           type: string
 *         isPrimary:
 *           type: boolean
 *     Product:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         slug:
 *           type: string
 *         description:
 *           type: string
 *         shortDescription:
 *           type: string
 *         price:
 *           type: number
 *         originalPrice:
 *           type: number
 *         discount:
 *           type: number
 *         images:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductImage'
 *         category:
 *           type: string
 *         brand:
 *           type: string
 *         stock:
 *           type: number
 *         status:
 *           type: string
 *           enum: [active, inactive, out_of_stock, discontinued]
 *         rating:
 *           type: object
 *           properties:
 *             average:
 *               type: number
 *             count:
 *               type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateProductRequest:
 *       type: object
 *       required:
 *         - name
 *         - price
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         shortDescription:
 *           type: string
 *         price:
 *           type: number
 *           minimum: 0
 *         originalPrice:
 *           type: number
 *           minimum: 0
 *         category:
 *           type: string
 *         brand:
 *           type: string
 *         stock:
 *           type: number
 *           minimum: 0
 *           default: 0
 *         status:
 *           type: string
 *           enum: [active, inactive, out_of_stock, discontinued]
 *           default: active
 *         images:
 *           type: array
 *           items:
 *             type: object
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     description: Retrieve a paginated list of products with filtering, searching, and sorting options
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Number of items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Filter by brand
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, out_of_stock, discontinued]
 *         description: Filter by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name, description, and tags
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *                     pagination:
 *                       type: object
 *       500:
 *         description: Internal server error
 */
productRouter.get("/", getProducts);

/**
 * @swagger
 * /api/products/featured:
 *   get:
 *     summary: Get featured products
 *     description: Retrieve featured products sorted by rating
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 8
 *         description: Number of products to return
 *     responses:
 *       200:
 *         description: Featured products retrieved successfully
 *       500:
 *         description: Internal server error
 */
productRouter.get("/featured", getFeaturedProducts);

/**
 * @swagger
 * /api/products/best-sellers:
 *   get:
 *     summary: Get best selling products
 *     description: Retrieve best selling products sorted by soldCount
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 8
 *         description: Number of products to return
 *     responses:
 *       200:
 *         description: Best sellers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *                     pagination:
 *                       type: object
 *       500:
 *         description: Internal server error
 */
productRouter.get("/best-sellers", getBestSellers);

/**
 * @swagger
 * /api/products/categories:
 *   get:
 *     summary: Get all product categories
 *     description: Retrieve all unique categories with product counts
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *       500:
 *         description: Internal server error
 */
productRouter.get("/categories", getCategories);

/**
 * @swagger
 * /api/products/brands:
 *   get:
 *     summary: Get all product brands
 *     description: Retrieve all unique brands with product counts
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Brands retrieved successfully
 *       500:
 *         description: Internal server error
 */
productRouter.get("/brands", getBrands);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID or slug
 *     description: Retrieve a single product by its ID or slug
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID or slug
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
productRouter.get("/:id", getProductById);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product (Admin only)
 *     description: Create a new product. Requires admin authentication.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductRequest'
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       500:
 *         description: Internal server error
 */
productRouter.post("/", verifyToken, verifyAdmin, createProduct);

/**
 * @swagger
 * /api/products/bulk:
 *   post:
 *     summary: Bulk create products (Admin only)
 *     description: Create multiple products at once. Maximum 100 products per request. Requires admin authentication.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - products
 *             properties:
 *               products:
 *                 type: array
 *                 maxItems: 100
 *                 items:
 *                   $ref: '#/components/schemas/CreateProductRequest'
 *     responses:
 *       201:
 *         description: Bulk import completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     succeeded:
 *                       type: number
 *                     failed:
 *                       type: number
 *                     results:
 *                       type: object
 *                       properties:
 *                         success:
 *                           type: array
 *                           items:
 *                             type: object
 *                         failed:
 *                           type: array
 *                           items:
 *                             type: object
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       500:
 *         description: Internal server error
 */
productRouter.post("/bulk", verifyToken, verifyAdmin, bulkCreateProducts);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product (Admin only)
 *     description: Update an existing product. Requires admin authentication.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductRequest'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
productRouter.put("/:id", verifyToken, verifyAdmin, updateProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product (Admin only)
 *     description: Delete a product and its images from Cloudinary. Requires admin authentication.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
productRouter.delete("/:id", verifyToken, verifyAdmin, deleteProduct);

/**
 * @swagger
 * /api/products/upload-images:
 *   post:
 *     summary: Upload product images (Admin only)
 *     description: Upload multiple product images to Cloudinary. Requires admin authentication.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 *       400:
 *         description: No files uploaded
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       500:
 *         description: Internal server error
 */
productRouter.post(
    "/upload-images",
    verifyToken,
    verifyAdmin,
    upload.array("images", 10), // Max 10 images
    uploadProductImages
);

export default productRouter;

