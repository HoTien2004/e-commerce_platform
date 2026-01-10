import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
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