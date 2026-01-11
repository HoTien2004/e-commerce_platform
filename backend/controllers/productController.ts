import type { Request, Response } from "express";
import productModel from "../models/productModel";
import { uploadImageFromBuffer, deleteImage, extractPublicIdFromUrl } from "../services/cloudinaryService";

// Get all products with pagination, filter, and search
export const getProducts = async (req: Request, res: Response): Promise<Response> => {
    try {
        const {
            page = "1",
            limit = "12",
            category,
            brand,
            minPrice,
            maxPrice,
            status,
            search,
            sortBy = "createdAt",
            sortOrder = "desc"
        } = req.query;

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const skip = (pageNum - 1) * limitNum;

        // Build filter object
        const filter: any = {};

        if (category) {
            filter.category = category;
        }

        if (brand) {
            filter.brand = brand;
        }

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) {
                filter.price.$gte = parseFloat(minPrice as string);
            }
            if (maxPrice) {
                filter.price.$lte = parseFloat(maxPrice as string);
            }
        }

        if (status) {
            filter.status = status;
        } else {
            // Default: only show active products for non-admin users
            const userId = (req as any).userId;
            if (!userId) {
                filter.status = "active";
            }
        }

        // Search functionality
        if (search) {
            filter.$or = [
                { name: { $regex: search as string, $options: "i" } },
                { description: { $regex: search as string, $options: "i" } }
            ];
        }

        // Build sort object
        const sort: any = {};
        sort[sortBy as string] = sortOrder === "asc" ? 1 : -1;

        // Execute query
        const [products, total] = await Promise.all([
            productModel.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limitNum)
                .lean(),
            productModel.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            data: {
                products,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(total / limitNum),
                    totalItems: total,
                    itemsPerPage: limitNum,
                    hasNextPage: pageNum < Math.ceil(total / limitNum),
                    hasPrevPage: pageNum > 1
                }
            }
        });
    } catch (error: any) {
        console.error("Error getting products:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get product by ID or slug
export const getProductById = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;

        // Check if id is ObjectId or slug
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);

        let product;
        if (isObjectId) {
            product = await productModel.findById(id);
        } else {
            product = await productModel.findOne({ slug: id });
        }

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Check if product is active (for non-admin users)
        const userId = (req as any).userId;
        if (!userId && product.status !== "active") {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: product
        });
    } catch (error: any) {
        console.error("Error getting product:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Create new product (Admin only)
export const createProduct = async (req: Request, res: Response): Promise<Response> => {
    try {
        const {
            name,
            description,
            shortDescription,
            price,
            originalPrice,
            category,
            brand,
            stock,
            status,
            images
        } = req.body;

        // Validate required fields
        if (!name || !price) {
            return res.status(400).json({
                success: false,
                message: "Name and price are required"
            });
        }

        // Validate price
        if (price < 0) {
            return res.status(400).json({
                success: false,
                message: "Price must be greater than or equal to 0"
            });
        }

        // Validate originalPrice if provided
        if (originalPrice && originalPrice < price) {
            return res.status(400).json({
                success: false,
                message: "Original price must be greater than or equal to price"
            });
        }

        // Validate stock
        if (stock !== undefined && stock < 0) {
            return res.status(400).json({
                success: false,
                message: "Stock must be greater than or equal to 0"
            });
        }

        // Process images if provided
        let processedImages: any[] = [];
        if (images && Array.isArray(images) && images.length > 0) {
            processedImages = images.map((img: any, index: number) => ({
                url: img.url || img,
                publicId: img.publicId || null,
                isPrimary: index === 0
            }));
        }

        // Determine final status
        let finalStatus = status || "active";
        if (stock !== undefined && stock === 0 && finalStatus === "active") {
            finalStatus = "out_of_stock";
        }

        // Create product
        const product = new productModel({
            name,
            description: description || "",
            shortDescription: shortDescription || "",
            price,
            originalPrice: originalPrice || undefined,
            category: category || "",
            brand: brand || "",
            stock: stock !== undefined ? stock : 0,
            status: finalStatus,
            images: processedImages,
            updatedAt: new Date()
        });

        // Generate slug
        (product as any).generateSlug();

        // Calculate discount
        (product as any).calculateDiscount();

        await product.save();

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product
        });
    } catch (error: any) {
        console.error("Error creating product:", error);

        // Handle duplicate key error
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                success: false,
                message: `${field} already exists`
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Update product (Admin only)
export const updateProduct = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Find product
        const product = await productModel.findById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Validate price if provided
        if (updateData.price !== undefined && updateData.price < 0) {
            return res.status(400).json({
                success: false,
                message: "Price must be greater than or equal to 0"
            });
        }

        // Validate originalPrice if provided
        if (updateData.originalPrice !== undefined) {
            const finalPrice = updateData.price !== undefined ? updateData.price : product.price;
            if (updateData.originalPrice < finalPrice) {
                return res.status(400).json({
                    success: false,
                    message: "Original price must be greater than or equal to price"
                });
            }
        }

        // Validate stock if provided
        if (updateData.stock !== undefined && updateData.stock < 0) {
            return res.status(400).json({
                success: false,
                message: "Stock must be greater than or equal to 0"
            });
        }

        // Process images if provided
        if (updateData.images && Array.isArray(updateData.images)) {
            updateData.images = updateData.images.map((img: any, index: number) => ({
                url: img.url || img,
                publicId: img.publicId || null,
                isPrimary: index === 0
            }));
        }

        // Update status based on stock if stock is being updated
        if (updateData.stock !== undefined) {
            const finalStock = updateData.stock;
            if (finalStock === 0 && (!updateData.status || updateData.status === "active")) {
                updateData.status = "out_of_stock";
            } else if (finalStock > 0 && product.status === "out_of_stock" && !updateData.status) {
                updateData.status = "active";
            }
        }

        // Generate slug if name is being updated
        if (updateData.name && updateData.name !== product.name) {
            const slug = updateData.name
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
            updateData.slug = slug;
        }

        // Calculate discount if price or originalPrice is being updated
        if (updateData.originalPrice !== undefined || updateData.price !== undefined) {
            const finalPrice = updateData.price !== undefined ? updateData.price : product.price;
            const finalOriginalPrice = updateData.originalPrice !== undefined ? updateData.originalPrice : product.originalPrice;
            if (finalOriginalPrice && finalOriginalPrice > finalPrice) {
                updateData.discount = Math.round(((finalOriginalPrice - finalPrice) / finalOriginalPrice) * 100);
            } else {
                updateData.discount = 0;
            }
        }

        // Update product
        const updatedProduct = await productModel.findByIdAndUpdate(
            id,
            { ...updateData, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: updatedProduct
        });
    } catch (error: any) {
        console.error("Error updating product:", error);

        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                success: false,
                message: `${field} already exists`
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Delete product (Admin only)
export const deleteProduct = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;

        const product = await productModel.findById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Delete images from Cloudinary
        if (product.images && product.images.length > 0) {
            for (const image of product.images) {
                if (image.publicId) {
                    try {
                        await deleteImage(image.publicId);
                    } catch (error) {
                        console.error(`Error deleting image ${image.publicId}:`, error);
                    }
                }
            }
        }

        // Delete product
        await productModel.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    } catch (error: any) {
        console.error("Error deleting product:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Upload product images (Admin only)
export const uploadProductImages = async (req: Request, res: Response): Promise<Response> => {
    try {
        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No files uploaded"
            });
        }

        const uploadedImages = [];

        for (const file of files) {
            try {
                const result = await uploadImageFromBuffer(
                    file.buffer,
                    "products",
                    undefined
                );

                uploadedImages.push({
                    url: result.url,
                    publicId: result.publicId,
                    isPrimary: uploadedImages.length === 0
                });
            } catch (error: any) {
                console.error(`Error uploading image ${file.originalname}:`, error);
                // Continue with other images even if one fails
            }
        }

        if (uploadedImages.length === 0) {
            return res.status(500).json({
                success: false,
                message: "Failed to upload any images"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Images uploaded successfully",
            data: uploadedImages
        });
    } catch (error: any) {
        console.error("Error uploading product images:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get product categories
export const getCategories = async (req: Request, res: Response): Promise<Response> => {
    try {
        const categories = await productModel.distinct("category");
        const categoriesWithCount = await Promise.all(
            categories.map(async (category) => {
                const count = await productModel.countDocuments({
                    category,
                    status: "active"
                });
                return { category, count };
            })
        );

        return res.status(200).json({
            success: true,
            data: categoriesWithCount.filter(c => c.category)
        });
    } catch (error: any) {
        console.error("Error getting categories:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get product brands
export const getBrands = async (req: Request, res: Response): Promise<Response> => {
    try {
        const brands = await productModel.distinct("brand");
        const brandsWithCount = await Promise.all(
            brands.map(async (brand) => {
                const count = await productModel.countDocuments({
                    brand,
                    status: "active"
                });
                return { brand, count };
            })
        );

        return res.status(200).json({
            success: true,
            data: brandsWithCount.filter(b => b.brand)
        });
    } catch (error: any) {
        console.error("Error getting brands:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get featured products (sorted by rating)
export const getFeaturedProducts = async (req: Request, res: Response): Promise<Response> => {
    try {
        const limit = parseInt(req.query.limit as string, 10) || 8;

        const products = await productModel
            .find({ status: "active" })
            .sort({ "rating.average": -1, createdAt: -1 })
            .limit(limit)
            .lean();

        return res.status(200).json({
            success: true,
            data: {
                products,
                pagination: {
                    page: 1,
                    limit,
                    total: products.length,
                    pages: 1
                }
            }
        });
    } catch (error: any) {
        console.error("Error getting featured products:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get best selling products (sorted by soldCount)
export const getBestSellers = async (req: Request, res: Response): Promise<Response> => {
    try {
        const limit = parseInt(req.query.limit as string, 10) || 8;

        const products = await productModel
            .find({ status: "active" })
            .sort({ soldCount: -1, createdAt: -1 })
            .limit(limit)
            .lean();

        return res.status(200).json({
            success: true,
            data: {
                products,
                pagination: {
                    page: 1,
                    limit,
                    total: products.length,
                    pages: 1
                }
            }
        });
    } catch (error: any) {
        console.error("Error getting best sellers:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Bulk create products (Admin only)
export const bulkCreateProducts = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { products } = req.body;

        // Validate input
        if (!products || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Products array is required and must not be empty"
            });
        }

        if (products.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Maximum 100 products can be created at once"
            });
        }

        const results = {
            success: [] as any[],
            failed: [] as Array<{ index: number; name?: string; error: string }>
        };

        // Process each product
        for (let i = 0; i < products.length; i++) {
            const productData = products[i];

            try {
                // Validate required fields
                if (!productData.name || productData.price === undefined || productData.price === null) {
                    results.failed.push({
                        index: i,
                        name: productData.name || "Unknown",
                        error: "Name and price are required"
                    });
                    continue;
                }

                // Validate price
                if (typeof productData.price !== 'number' || productData.price < 0) {
                    results.failed.push({
                        index: i,
                        name: productData.name,
                        error: "Price must be a number >= 0"
                    });
                    continue;
                }

                // Validate originalPrice if provided
                if (productData.originalPrice !== undefined && productData.originalPrice < productData.price) {
                    results.failed.push({
                        index: i,
                        name: productData.name,
                        error: "Original price must be >= price"
                    });
                    continue;
                }

                // Validate stock
                if (productData.stock !== undefined && productData.stock < 0) {
                    results.failed.push({
                        index: i,
                        name: productData.name,
                        error: "Stock must be >= 0"
                    });
                    continue;
                }

                // Process images if provided
                let processedImages: any[] = [];
                if (productData.images && Array.isArray(productData.images) && productData.images.length > 0) {
                    processedImages = productData.images.map((img: any, index: number) => ({
                        url: img.url || img,
                        publicId: img.publicId || null,
                        isPrimary: index === 0
                    }));
                }

                // Determine final status
                let finalStatus = productData.status || "active";
                if (productData.stock !== undefined && productData.stock === 0 && finalStatus === "active") {
                    finalStatus = "out_of_stock";
                }

                // Create product
                const product = new productModel({
                    name: productData.name,
                    description: productData.description || "",
                    shortDescription: productData.shortDescription || "",
                    price: productData.price,
                    originalPrice: productData.originalPrice || undefined,
                    category: productData.category || "",
                    brand: productData.brand || "",
                    stock: productData.stock !== undefined ? productData.stock : 0,
                    status: finalStatus,
                    images: processedImages,
                    updatedAt: new Date()
                });

                // Generate slug
                (product as any).generateSlug();

                // Calculate discount
                (product as any).calculateDiscount();

                // Save product
                await product.save();

                results.success.push({
                    index: i,
                    id: product._id,
                    name: product.name
                });

            } catch (error: any) {
                // Handle duplicate slug error
                if (error.code === 11000) {
                    results.failed.push({
                        index: i,
                        name: productData.name || "Unknown",
                        error: "Product with this name already exists (duplicate slug)"
                    });
                } else {
                    results.failed.push({
                        index: i,
                        name: productData.name || "Unknown",
                        error: error.message || "Unknown error"
                    });
                }
            }
        }

        return res.status(201).json({
            success: true,
            message: `Bulk import completed: ${results.success.length} succeeded, ${results.failed.length} failed`,
            data: {
                total: products.length,
                succeeded: results.success.length,
                failed: results.failed.length,
                results: {
                    success: results.success,
                    failed: results.failed
                }
            }
        });

    } catch (error: any) {
        console.error("Error bulk creating products:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

