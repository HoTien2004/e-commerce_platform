import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const dropUniqueIndex = async () => {
    try {
        // Connect to MongoDB (using DB env var like in db.ts)
        const mongoUri = process.env.DB;
        if (!mongoUri) {
            console.error('❌ DB not found in .env file');
            process.exit(1);
        }
        
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Get the collection
        const collection = mongoose.connection.collection('reviews');

        // List all indexes
        const indexes = await collection.indexes();
        console.log('📋 Current indexes:', indexes);

        // Drop the unique index if it exists
        try {
            await collection.dropIndex('userId_1_productId_1');
            console.log('✅ Dropped unique index: userId_1_productId_1');
        } catch (error: any) {
            if (error.code === 27 || error.codeName === 'IndexNotFound') {
                console.log('ℹ️  Index does not exist, skipping...');
            } else {
                throw error;
            }
        }

        // Create non-unique index
        await collection.createIndex({ userId: 1, productId: 1 }, { unique: false });
        console.log('✅ Created non-unique index: userId_1_productId_1');

        // List indexes again to verify
        const newIndexes = await collection.indexes();
        console.log('📋 Updated indexes:', newIndexes);

        console.log('✅ Done!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

dropUniqueIndex();

