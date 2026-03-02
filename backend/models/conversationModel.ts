import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
    {
        role: { type: String, enum: ["user", "model"], required: true },
        text: { type: String, required: true },
    },
    { _id: true }
);

const conversationSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
        title: { type: String, default: "Cuộc hội thoại mới" },
        messages: [chatMessageSchema],
    },
    { timestamps: true }
);

conversationSchema.index({ userId: 1, updatedAt: -1 });

const conversationModel =
    mongoose.models.conversation || mongoose.model("conversation", conversationSchema);

export default conversationModel;
