import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import { connectDB } from "./config/db";
import { swaggerSpec } from "./config/swagger";
import userRouter from "./routes/userRoute";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
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
// app.use("/api/products", productRouter);

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

app.listen(port, () => {
    console.log(`Server Started on http://localhost:${port}`)
    console.log(`Swagger docs available at http://localhost:${port}/api-docs`)
})