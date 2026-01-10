import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        index: true
    },
    description: {
        type: String,
        default: ""
    },
    shortDescription: {
        type: String,
        default: "",
        maxlength: 200
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    originalPrice: {
        type: Number,
        min: 0
    },
    discount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    images: [{
        url: { type: String, required: true },
        publicId: { type: String },
        isPrimary: { type: Boolean, default: false }
    }],
    category: {
        type: String,
        default: "",
        index: true
    },
    brand: {
        type: String,
        default: "",
        index: true
    },
    stock: {
        type: Number,
        default: 0,
        min: 0
    },
    status: {
        type: String,
        enum: ["active", "inactive", "out_of_stock", "discontinued"],
        default: "active",
        index: true
    },
    rating: {
        average: { type: Number, default: 0, min: 0, max: 5 },
        count: { type: Number, default: 0, min: 0 }
    },
    tags: [{
        type: String,
        trim: true
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { minimize: false, timestamps: false });

// Index for search
productSchema.index({ name: "text", description: "text", tags: "text" });

// Helper method to generate slug
productSchema.methods.generateSlug = function () {
    if (!this.slug && this.name) {
        this.slug = this.name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    }
};

// Helper method to calculate discount
productSchema.methods.calculateDiscount = function () {
    if (this.originalPrice && this.originalPrice > this.price) {
        this.discount = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
    }
};

// Helper method to update status based on stock
productSchema.methods.updateStatusByStock = function () {
    if (this.stock === 0 && this.status === "active") {
        this.status = "out_of_stock";
    } else if (this.stock > 0 && this.status === "out_of_stock") {
        this.status = "active";
    }
};

const productModel = mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;

