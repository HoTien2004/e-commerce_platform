import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true,
        index: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'order',
        default: null,
        index: true
    },
    rating: {
        type: Number,
        required: false,
        min: 1,
        max: 5,
        index: true,
        default: null
    },
    comment: {
        type: String,
        default: "",
        maxlength: 2000
    },
    likes: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    helpfulCount: {
        type: Number,
        default: 0,
        min: 0
    },
    isVerifiedPurchase: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { minimize: false, timestamps: false });

// Index for efficient queries (removed unique constraint to allow multiple reviews per user)
reviewSchema.index({ userId: 1, productId: 1 });

// Index for efficient queries
reviewSchema.index({ productId: 1, createdAt: -1 });
reviewSchema.index({ productId: 1, rating: 1 });

// Method to check if user has liked this review
reviewSchema.methods.hasUserLiked = function (userId: string): boolean {
    return this.likes.some((like: any) => like.userId.toString() === userId.toString());
};

// Method to toggle like
reviewSchema.methods.toggleLike = function (userId: string): { liked: boolean; helpfulCount: number } {
    const likeIndex = this.likes.findIndex((like: any) => like.userId.toString() === userId.toString());

    if (likeIndex > -1) {
        // Unlike
        this.likes.splice(likeIndex, 1);
        this.helpfulCount = Math.max(0, this.helpfulCount - 1);
    } else {
        // Like
        this.likes.push({ userId, createdAt: new Date() });
        this.helpfulCount += 1;
    }

    return {
        liked: likeIndex === -1,
        helpfulCount: this.helpfulCount
    };
};

const reviewModel = mongoose.models.review || mongoose.model("review", reviewSchema);

export default reviewModel;

