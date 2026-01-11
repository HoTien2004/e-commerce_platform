import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import { connectDB } from "./config/db";
import { swaggerSpec } from "./config/swagger";
import userRouter from "./routes/userRoute";
import cartRouter from "./routes/cartRoute";
import productRouter from "./routes/productRoute";
import promoCodeRouter from "./routes/promoCodeRoute";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
// app.use(cors({
//     origin: 'http://localhost:5173',
//     credentials: true
// }));
app.use(express.json());

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "Ecommerce API Documentation"
}));

// db connection
connectDB().catch((error) => {
    console.error('❌ Database connection failed:', error);
    process.exit(1); // Exit process if DB connection fails
});

// api endpoints
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/products", productRouter);
app.use("/api/promo-code", promoCodeRouter);

// Health check endpoint for Render
app.get("/health", (req, res) => {
    const dbStatus = mongoose.connection.readyState;
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    const isConnected = dbStatus === 1;

    res.status(isConnected ? 200 : 503).json({
        status: isConnected ? "healthy" : "unhealthy",
        database: isConnected ? "connected" : "disconnected",
        timestamp: new Date().toISOString()
    });
});

app.get("/", (req, res) => {
    res.send("API Working - Swagger docs at /api-docs")
})

// 404 handler - must be after all routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
        path: req.originalUrl
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server Started on http://localhost:${port}`)
    console.log(`Swagger docs available at http://localhost:${port}/api-docs`)
}).on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${port} is already in use`);
    } else {
        console.error('❌ Server error:', error);
    }
    process.exit(1);
});