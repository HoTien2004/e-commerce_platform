import swaggerJsdoc from "swagger-jsdoc";
import path from "path";

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Ecommerce API",
            version: "1.0.0",
            description: "API documentation for Ecommerce Website",
            contact: {
                name: "API Support",
            },
        },
        servers: [
            {
                url: process.env.API_BASE_URL || "http://localhost:3000",
                description: process.env.NODE_ENV === "production" ? "Production server" : "Development server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
    },
    apis: [
        path.join(process.cwd(), "routes/*.ts"),
        path.join(process.cwd(), "routes/*.js"),
    ],
};

export const swaggerSpec = swaggerJsdoc(options);

