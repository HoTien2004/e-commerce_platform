/**
 * Script để import sản phẩm từ file SAMPLE_PRODUCTS_20.json
 * 
 * Cách sử dụng:
 * 1. Đảm bảo đã có file .env với DB connection string
 * 2. Đảm bảo đã có tài khoản admin trong database
 * 3. Chạy: npm run import-products
 *    hoặc: npx ts-node scripts/importProducts.ts
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import productModel from "../models/productModel";

// Load environment variables
dotenv.config();

// Connect to database
const connectDB = async (): Promise<void> => {
    const uri = process.env.DB;

    if (!uri) {
        throw new Error("Database connection string (process.env.DB) is not defined");
    }

    const options = {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 2,
        retryWrites: true,
        w: 'majority' as const,
    };

    try {
        await mongoose.connect(uri, options);
        const dbName = mongoose.connection.db?.databaseName || "unknown";
        console.log(`✅ MongoDB connected to database: ${dbName}`);
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error);
        throw error;
    }
};

// Import products from JSON file
const importProducts = async (): Promise<void> => {
    try {
        // Read JSON file
        const jsonPath = path.join(process.cwd(), "SAMPLE_PRODUCTS_20.json");

        if (!fs.existsSync(jsonPath)) {
            throw new Error(`File not found: ${jsonPath}`);
        }

        const fileContent = fs.readFileSync(jsonPath, "utf-8");
        const products = JSON.parse(fileContent);

        if (!Array.isArray(products)) {
            throw new Error("JSON file must contain an array of products");
        }

        console.log(`\n📦 Found ${products.length} products to import...\n`);

        let successCount = 0;
        let errorCount = 0;

        // Import each product
        for (let i = 0; i < products.length; i++) {
            const productData = products[i];

            try {
                // Validate required fields
                if (!productData.name || productData.price === undefined || productData.price === null) {
                    console.error(`❌ Product ${i + 1}: Missing required fields (name or price)`);
                    errorCount++;
                    continue;
                }

                // Validate price
                if (typeof productData.price !== 'number' || productData.price < 0) {
                    console.error(`❌ Product ${i + 1}: Invalid price (must be number >= 0)`);
                    errorCount++;
                    continue;
                }

                // Validate originalPrice if provided
                if (productData.originalPrice !== undefined && productData.originalPrice < productData.price) {
                    console.error(`❌ Product ${i + 1}: Original price must be >= price`);
                    errorCount++;
                    continue;
                }

                // Create product
                const product = new productModel({
                    name: productData.name,
                    description: productData.description || "",
                    price: productData.price,
                    originalPrice: productData.originalPrice || undefined,
                    category: productData.category || "",
                    brand: productData.brand || "",
                    stock: productData.stock !== undefined ? productData.stock : 0,
                    status: productData.status || "active",
                    images: productData.images || [],
                    updatedAt: new Date()
                });

                // Generate slug
                (product as any).generateSlug();

                // Calculate discount
                (product as any).calculateDiscount();

                // Save product
                await product.save();

                console.log(`✅ [${i + 1}/${products.length}] Imported: ${productData.name}`);
                successCount++;

            } catch (error: any) {
                // Handle duplicate slug error
                if (error.code === 11000) {
                    console.error(`⚠️  [${i + 1}/${products.length}] Skipped (duplicate): ${productData.name}`);
                } else {
                    console.error(`❌ [${i + 1}/${products.length}] Error importing "${productData.name}":`, error.message);
                }
                errorCount++;
            }
        }

        // Summary
        console.log(`\n📊 Import Summary:`);
        console.log(`   ✅ Success: ${successCount}`);
        console.log(`   ❌ Errors: ${errorCount}`);
        console.log(`   📦 Total: ${products.length}\n`);

    } catch (error: any) {
        console.error("❌ Error importing products:", error.message);
        throw error;
    }
};

// Main function
const main = async (): Promise<void> => {
    try {
        await connectDB();
        await importProducts();
        await mongoose.connection.close();
        console.log("✅ Import completed. Database connection closed.");
        process.exit(0);
    } catch (error: any) {
        console.error("❌ Import failed:", error.message);
        process.exit(1);
    }
};

// Run script
main();

