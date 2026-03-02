import type { Request, Response } from "express";
import conversationModel from "../models/conversationModel";
import { sendChatWithHistory } from "../services/geminiService";

// GET /api/chat/conversations - Danh sách hội thoại của user
export const getConversations = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userId = (req as any).userId;
        const conversations = await conversationModel
            .find({ userId })
            .sort({ updatedAt: -1 })
            .select("_id title updatedAt")
            .lean();

        return res.status(200).json({
            success: true,
            data: { conversations },
        });
    } catch (error: any) {
        console.error("Error getting conversations:", error);
        return res.status(500).json({
            success: false,
            message: "Không thể tải danh sách hội thoại",
            error: error?.message,
        });
    }
};

// POST /api/chat/conversations - Tạo hội thoại mới
export const createConversation = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userId = (req as any).userId;
        const doc = await conversationModel.create({
            userId,
            title: "Cuộc hội thoại mới",
            messages: [],
        });

        return res.status(201).json({
            success: true,
            data: {
                conversation: {
                    _id: doc._id,
                    title: doc.title,
                    messages: [],
                    createdAt: doc.createdAt,
                    updatedAt: doc.updatedAt,
                },
            },
        });
    } catch (error: any) {
        console.error("Error creating conversation:", error);
        return res.status(500).json({
            success: false,
            message: "Không thể tạo hội thoại mới",
            error: error?.message,
        });
    }
};

// GET /api/chat/conversations/:id - Chi tiết một hội thoại (messages)
export const getConversationById = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userId = (req as any).userId;
        const { id } = req.params;

        const conversation = await conversationModel.findOne({ _id: id, userId }).lean();
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy hội thoại",
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                conversation: {
                    _id: conversation._id,
                    title: conversation.title,
                    messages: conversation.messages || [],
                    updatedAt: conversation.updatedAt,
                },
            },
        });
    } catch (error: any) {
        console.error("Error getting conversation:", error);
        return res.status(500).json({
            success: false,
            message: "Không thể tải hội thoại",
            error: error?.message,
        });
    }
};

// POST /api/chat/conversations/:id/messages - Gửi tin nhắn, nhận reply từ Gemini, lưu vào DB
export const sendMessage = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userId = (req as any).userId;
        const { id: conversationId } = req.params;
        const { text } = req.body as { text?: string };

        if (!text || typeof text !== "string" || !text.trim()) {
            return res.status(400).json({
                success: false,
                message: "Nội dung tin nhắn không được để trống",
            });
        }

        const conversation = await conversationModel.findOne({ _id: conversationId, userId });
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy hội thoại",
            });
        }

        const userMessage = text.trim();

        // Cập nhật title bằng tin nhắn đầu tiên của user (nếu vẫn là mặc định)
        if (
            !conversation.title ||
            conversation.title === "Cuộc hội thoại mới"
        ) {
            const shortTitle =
                userMessage.length > 40 ? userMessage.substring(0, 37) + "..." : userMessage;
            conversation.title = shortTitle;
        }

        // Lấy history hiện tại (chỉ role + text để gửi Gemini, không hiển thị "gán" ở FE)
        const history = (conversation.messages || []).map((m: any) => ({
            role: m.role,
            text: m.text,
        }));

        // Gọi Gemini với context (history + userMessage)
        const modelReply = await sendChatWithHistory(userMessage, history);

        // Thêm user message và model reply vào DB
        conversation.messages.push(
            { role: "user", text: userMessage },
            { role: "model", text: modelReply }
        );
        await conversation.save();

        return res.status(200).json({
            success: true,
            data: {
                userMessage: { role: "user", text: userMessage },
                modelReply: { role: "model", text: modelReply },
            },
        });
    } catch (error: any) {
        console.error("Error sending message:", error);
        return res.status(500).json({
            success: false,
            message: error?.message?.includes("GEMINI_API_KEY")
                ? "Chatbot chưa được cấu hình. Vui lòng liên hệ quản trị viên."
                : "Không thể gửi tin nhắn. Vui lòng thử lại.",
            error: error?.message,
        });
    }
};

// DELETE /api/chat/conversations/:id - Xóa hội thoại
export const deleteConversation = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userId = (req as any).userId;
        const { id } = req.params;

        const result = await conversationModel.findOneAndDelete({ _id: id, userId });
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy hội thoại",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Đã xóa hội thoại",
        });
    } catch (error: any) {
        console.error("Error deleting conversation:", error);
        return res.status(500).json({
            success: false,
            message: "Không thể xóa hội thoại",
            error: error?.message,
        });
    }
};
