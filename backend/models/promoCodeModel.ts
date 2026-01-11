import mongoose from "mongoose";

const promoCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        index: true
    },
    type: {
        type: String,
        enum: ["percentage", "fixed", "freeship"],
        required: true
    },
    value: {
        type: Number,
        required: true,
        min: 0
    },
    minOrder: {
        type: Number,
        default: 0,
        min: 0
    },
    maxDiscount: {
        type: Number,
        default: null, // null means no limit
        min: 0
    },
    validFrom: {
        type: Date,
        required: true
    },
    validTo: {
        type: Date,
        required: true
    },
    usageLimit: {
        type: Number,
        default: null, // null means unlimited
        min: 0
    },
    usedCount: {
        type: Number,
        default: 0,
        min: 0
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    description: {
        type: String,
        default: ""
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

// Index for active codes
promoCodeSchema.index({ code: 1, isActive: 1 });

// Method to check if code is valid
promoCodeSchema.methods.isValid = function (orderTotal: number): { valid: boolean; message?: string } {
    const now = new Date();
    
    if (!this.isActive) {
        return { valid: false, message: "Mã khuyến mãi không còn hiệu lực" };
    }
    
    if (now < this.validFrom) {
        return { valid: false, message: "Mã khuyến mãi chưa có hiệu lực" };
    }
    
    if (now > this.validTo) {
        return { valid: false, message: "Mã khuyến mãi đã hết hạn" };
    }
    
    if (this.usageLimit !== null && this.usedCount >= this.usageLimit) {
        return { valid: false, message: "Mã khuyến mãi đã hết lượt sử dụng" };
    }
    
    if (orderTotal < this.minOrder) {
        return { valid: false, message: `Đơn hàng tối thiểu ${this.minOrder.toLocaleString('vi-VN')}₫ để sử dụng mã này` };
    }
    
    return { valid: true };
};

// Method to calculate discount amount
promoCodeSchema.methods.calculateDiscount = function (orderTotal: number): number {
    if (this.type === "freeship") {
        return 0; // Free shipping is handled separately
    }
    
    let discount = 0;
    
    if (this.type === "percentage") {
        discount = (orderTotal * this.value) / 100;
        if (this.maxDiscount !== null && discount > this.maxDiscount) {
            discount = this.maxDiscount;
        }
    } else if (this.type === "fixed") {
        discount = this.value;
        if (discount > orderTotal) {
            discount = orderTotal;
        }
    }
    
    return Math.round(discount);
};

const promoCodeModel = mongoose.models.promoCode || mongoose.model("promoCode", promoCodeSchema);

export default promoCodeModel;

