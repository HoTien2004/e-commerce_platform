import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    price: {
        type: Number,
        required: true
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: true });

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        unique: true
    },
    items: [cartItemSchema],
    total: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { minimize: false, timestamps: false });

// Helper method to calculate total
cartSchema.methods.calculateTotal = function () {
    if (this.items && this.items.length > 0) {
        this.total = this.items.reduce((sum: number, item: any) => {
            return sum + (item.price * item.quantity);
        }, 0);
    } else {
        this.total = 0;
    }
    this.updatedAt = new Date();
};

const cartModel = mongoose.models.cart || mongoose.model("cart", cartSchema);

export default cartModel;

