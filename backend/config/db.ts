import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
    const uri = process.env.DB;

    if (!uri) {
        throw new Error("Database connection string (process.env.DB) is not defined");
    }

    // Connection options optimized for MongoDB Atlas and Render
    const options = {
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        maxPoolSize: 10, // Maintain up to 10 socket connections
        minPoolSize: 2, // Maintain at least 2 socket connections
        retryWrites: true, // Retry failed writes
        w: 'majority' as const, // Write concern
    };

    try {
        await mongoose.connect(uri, options);
        const dbName = mongoose.connection.db?.databaseName || "unknown";
        console.log(`✅ MongoDB connected to database: ${dbName}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected');
        });

    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error);
        throw error;
    }
};