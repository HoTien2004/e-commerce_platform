import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    name: {
        type: String,
        required: true
    }
}, { _id: true });

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: false, // Will be auto-generated in pre-save hook
        unique: true,
        sparse: true, // Allow multiple undefined values for unique constraint
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true
    },
    items: [orderItemSchema],
    shippingAddress: {
        type: String,
        required: true
    },
    shippingFee: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },
    discount: {
        type: Number,
        default: 0,
        min: 0
    },
    total: {
        type: Number,
        required: true,
        min: 0
    },
    // Payment method and status
    paymentMethod: {
        type: String,
        enum: ['cod', 'vnpay', 'momo'],
        required: true,
        default: 'cod'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentProvider: {
        type: String,
        enum: ['momo', 'vnpay', null],
        default: null
    },
    paymentTransactionId: {
        type: String,
        default: null
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'shipped', 'delivered', 'cancelled', 'returned'],
        required: true,
        default: 'pending'
    },
    promoCode: {
        type: String,
        default: null
    },
    notes: {
        type: String,
        default: null
    },
    // Customer info at time of order (snapshot)
    customerInfo: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String, required: true }
    }
}, { minimize: false, timestamps: true });

// Generate order number before saving (only for new documents)
orderSchema.pre('save', async function () {
    // Only generate if orderNumber is not set (for new documents)
    if (!this.orderNumber) {
        // Generate order number: TS-YYYYMMDD-HHMMSS-XXXX
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.orderNumber = `TS-${dateStr}-${timeStr}-${random}`;
    }
});

// Index for better query performance
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ orderNumber: 1 });

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;

