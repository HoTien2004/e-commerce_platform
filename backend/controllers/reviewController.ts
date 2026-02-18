import type { Request, Response } from "express";
import mongoose from "mongoose";
import reviewModel from "../models/reviewModel";
import productModel from "../models/productModel";
import userModel from "../models/userModel";
import orderModel from "../models/orderModel";

// Create review
export const createReview = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userId = (req as any).userId;
        const { productId, rating, comment, orderId } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        // Rating is optional, but if provided must be valid
        if (rating !== undefined && rating !== null) {
            if (rating < 1 || rating > 5) {
                return res.status(400).json({
                    success: false,
                    message: "Rating must be between 1 and 5"
                });
            }
        }

        // Must have either rating or comment
        if (!rating && !comment) {
            return res.status(400).json({
                success: false,
                message: "Either rating or comment is required"
            });
        }

        // Check if product exists
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Check if user has already rated this product
        const existingRatingReview = await reviewModel.findOne({
            userId,
            productId,
            rating: { $ne: null }
        });

        // If user tries to rate again, reject
        if (rating && existingRatingReview) {
            return res.status(400).json({
                success: false,
                message: "Bạn đã đánh giá sản phẩm này rồi. Bạn chỉ có thể thêm bình luận."
            });
        }

        // Check if orderId is provided and verify purchase
        let isVerifiedPurchase = false;
        if (orderId) {
            const order = await orderModel.findOne({
                _id: orderId,
                userId,
                orderStatus: 'delivered'
            });
            if (order) {
                const hasProduct = order.items.some((item: any) => 
                    item.productId.toString() === productId.toString()
                );
                isVerifiedPurchase = hasProduct;
            }
        }

        let review;

        // If rating is provided (and user hasn't rated before), create rating review
        if (rating) {
            // Create new review with rating (and comment if provided)
            review = await reviewModel.create({
                userId,
                productId,
                orderId: orderId || null,
                rating,
                comment: comment ? comment.trim() : "",
                isVerifiedPurchase,
                likes: [],
                helpfulCount: 0
            });
        }

        // If comment is provided, create comment review
        // (either as part of rating review above, or as separate comment-only review)
        if (comment && comment.trim()) {
            // If we already created a rating review with this comment, skip
            // Otherwise, create a comment-only review
            if (!rating || !review || review.comment !== comment.trim()) {
                review = await reviewModel.create({
                    userId,
                    productId,
                    orderId: orderId || null,
                    rating: null, // Comment-only review has no rating
                    comment: comment.trim(),
                    isVerifiedPurchase,
                    likes: [],
                    helpfulCount: 0
                });
            }
        }

        // Update product rating (only counts rating per user, but counts all reviews)
        await updateProductRating(productId);

        // If we created/updated a review, use that for response
        // Otherwise, get the latest review
        if (!review) {
            review = await reviewModel.findOne({ userId, productId })
                .sort({ createdAt: -1 });
        }

        // Populate user info
        if (review) {
            await review.populate('userId', 'firstName lastName avatar');
        }

        return res.status(201).json({
            success: true,
            message: rating ? "Rating updated and comment added successfully" : "Comment added successfully",
            data: { review }
        });

    } catch (error: any) {
        console.error("Error creating review:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get reviews for a product with pagination
export const getProductReviews = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { productId } = req.params;
        const { page = "1", limit = "10", rating } = req.query;
        const userId = (req as any).userId; // Optional, for checking likes

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const skip = (pageNum - 1) * limitNum;

        // Build filter
        const filter: any = { productId };
        if (rating) {
            filter.rating = parseInt(rating as string, 10);
        }

        // Get reviews with pagination
        const [reviews, total] = await Promise.all([
            reviewModel.find(filter)
                .populate('userId', 'firstName lastName avatar')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            reviewModel.countDocuments(filter)
        ]);

        // Check if current user liked each review
        if (userId) {
            reviews.forEach((review: any) => {
                review.userLiked = review.likes.some((like: any) => 
                    like.userId.toString() === userId.toString()
                );
            });
        }

        // Get rating distribution
        const ratingDistribution = await reviewModel.aggregate([
            { $match: { productId: new mongoose.Types.ObjectId(productId) } },
            {
                $group: {
                    _id: "$rating",
                    count: { $sum: 1 }
                }
            }
        ]);

        const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        ratingDistribution.forEach((item: any) => {
            distribution[item._id] = item.count;
        });

        return res.status(200).json({
            success: true,
            data: {
                reviews,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(total / limitNum),
                    totalItems: total,
                    itemsPerPage: limitNum,
                    hasNextPage: pageNum < Math.ceil(total / limitNum),
                    hasPrevPage: pageNum > 1
                },
                ratingDistribution: distribution
            }
        });

    } catch (error: any) {
        console.error("Error getting reviews:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Toggle like on review
export const toggleReviewLike = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userId = (req as any).userId;
        const { reviewId } = req.params;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        if (!reviewId) {
            return res.status(400).json({
                success: false,
                message: "Review ID is required"
            });
        }

        const review = await reviewModel.findById(reviewId);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        const result = review.toggleLike(userId);
        await review.save();

        return res.status(200).json({
            success: true,
            message: result.liked ? "Review liked" : "Review unliked",
            data: {
                liked: result.liked,
                helpfulCount: result.helpfulCount
            }
        });

    } catch (error: any) {
        console.error("Error toggling review like:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Update product rating based on latest rating from each user
// Only count rating from reviews that have rating (1 rating per user), but count all reviews for total count
const updateProductRating = async (productId: string): Promise<void> => {
    try {
        // Get all reviews for this product
        const allReviews = await reviewModel.find({ productId });
        
        if (allReviews.length === 0) {
            // No reviews, reset to default
            await productModel.findByIdAndUpdate(productId, {
                'rating.average': 0,
                'rating.count': 0,
                'rating.ratingCount': 0
            });
            return;
        }

        // Get rating from each user (only reviews with rating, one per user)
        const userRatings = new Map<string, number>();
        for (const review of allReviews) {
            if (review.rating !== null && review.rating !== undefined) {
                const userId = review.userId.toString();
                // Keep the first rating found (oldest, which is the one we update)
                if (!userRatings.has(userId)) {
                    userRatings.set(userId, review.rating);
                }
            }
        }

        // Calculate average rating (only from users who have rated)
        let average = 0;
        if (userRatings.size > 0) {
            const ratings = Array.from(userRatings.values());
            const totalRating = ratings.reduce((sum, rating) => sum + rating, 0);
            average = totalRating / ratings.length;
        }
        
        // Count all reviews (including comment-only reviews)
        const totalCount = allReviews.length;
        // Count only users who have rated (reviews with rating)
        const ratingCount = userRatings.size;

        await productModel.findByIdAndUpdate(productId, {
            'rating.average': Math.round(average * 10) / 10, // Round to 1 decimal
            'rating.count': totalCount, // Total number of reviews (comments)
            'rating.ratingCount': ratingCount // Number of users who have rated
        });

    } catch (error) {
        console.error("Error updating product rating:", error);
    }
};

// Get all reviews (admin only)
export const getAllReviews = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { page = "1", limit = "10", rating, productId, userId, search } = req.query;

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const skip = (pageNum - 1) * limitNum;

        // Build filter
        const filter: any = {};
        if (rating) {
            filter.rating = parseInt(rating as string, 10);
        }
        if (productId) {
            filter.productId = productId;
        }
        if (userId) {
            filter.userId = userId;
        }

        // Build search query
        let query = reviewModel.find(filter)
            .populate('userId', 'firstName lastName email avatar')
            .populate('productId', 'name slug images')
            .sort({ createdAt: -1 });

        // If search is provided, search in comments
        if (search) {
            query = query.find({ comment: { $regex: search as string, $options: 'i' } });
        }

        // Get reviews with pagination
        const [reviews, total] = await Promise.all([
            query.skip(skip).limit(limitNum).lean(),
            search
                ? reviewModel.countDocuments({ ...filter, comment: { $regex: search as string, $options: 'i' } })
                : reviewModel.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            data: {
                reviews,
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
        console.error("Error getting all reviews:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Delete review (user can delete their own review, admin can delete any)
export const deleteReview = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userId = (req as any).userId;
        const { reviewId } = req.params;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const review = await reviewModel.findById(reviewId);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        // Check ownership or admin role
        const isOwner = review.userId.toString() === userId.toString();
        
        // Check if user is admin
        const user = await userModel.findById(userId);
        const isAdmin = user?.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own reviews"
            });
        }

        const productId = review.productId.toString();
        await reviewModel.findByIdAndDelete(reviewId);

        // Update product rating
        await updateProductRating(productId);

        return res.status(200).json({
            success: true,
            message: "Review deleted successfully"
        });

    } catch (error: any) {
        console.error("Error deleting review:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

