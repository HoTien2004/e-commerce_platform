import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware";
import {
    getConversations,
    createConversation,
    getConversationById,
    sendMessage,
    deleteConversation,
} from "../controllers/chatController";

const chatRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Chatbot (Gemini) - hội thoại, lịch sử, gửi tin nhắn
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ChatMessage:
 *       type: object
 *       properties:
 *         role:
 *           type: string
 *           enum: [user, model]
 *         text:
 *           type: string
 *     ConversationSummary:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Conversation:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         messages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ChatMessage'
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     SendMessageRequest:
 *       type: object
 *       required:
 *         - text
 *       properties:
 *         text:
 *           type: string
 *           description: Nội dung tin nhắn (user gửi)
 */

/**
 * @swagger
 * /api/chat/conversations:
 *   get:
 *     summary: Danh sách hội thoại của user
 *     description: Lấy tất cả cuộc hội thoại chatbot của user đăng nhập, sắp xếp theo updatedAt giảm dần.
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách hội thoại
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     conversations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ConversationSummary'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
chatRouter.get("/conversations", verifyToken, getConversations);

/**
 * @swagger
 * /api/chat/conversations:
 *   post:
 *     summary: Tạo hội thoại mới
 *     description: Tạo một cuộc hội thoại chatbot mới (chưa có tin nhắn).
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Hội thoại đã tạo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     conversation:
 *                       $ref: '#/components/schemas/Conversation'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
chatRouter.post("/conversations", verifyToken, createConversation);

/**
 * @swagger
 * /api/chat/conversations/{id}:
 *   get:
 *     summary: Chi tiết một hội thoại (danh sách tin nhắn)
 *     description: Lấy nội dung đầy đủ một cuộc hội thoại theo id (chỉ hội thoại của user đăng nhập).
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID cuộc hội thoại (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Chi tiết hội thoại
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     conversation:
 *                       $ref: '#/components/schemas/Conversation'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Không tìm thấy hội thoại
 *       500:
 *         description: Internal server error
 */
chatRouter.get("/conversations/:id", verifyToken, getConversationById);

/**
 * @swagger
 * /api/chat/conversations/{id}/messages:
 *   post:
 *     summary: Gửi tin nhắn trong hội thoại
 *     description: Gửi tin nhắn (user), backend gọi Gemini với context (toàn bộ lịch sử), lưu user + reply vào DB và trả về.
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID cuộc hội thoại
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendMessageRequest'
 *           example:
 *             text: "Sản phẩm laptop có bảo hành bao lâu?"
 *     responses:
 *       200:
 *         description: Tin nhắn đã gửi và nhận reply từ Gemini
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     userMessage:
 *                       $ref: '#/components/schemas/ChatMessage'
 *                     modelReply:
 *                       $ref: '#/components/schemas/ChatMessage'
 *       400:
 *         description: Nội dung tin nhắn trống
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Không tìm thấy hội thoại
 *       500:
 *         description: Lỗi Gemini hoặc server
 */
chatRouter.post("/conversations/:id/messages", verifyToken, sendMessage);

/**
 * @swagger
 * /api/chat/conversations/{id}:
 *   delete:
 *     summary: Xóa hội thoại
 *     description: Xóa một cuộc hội thoại (chỉ của user đăng nhập).
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID cuộc hội thoại
 *     responses:
 *       200:
 *         description: Đã xóa hội thoại
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Đã xóa hội thoại"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Không tìm thấy hội thoại
 *       500:
 *         description: Internal server error
 */
chatRouter.delete("/conversations/:id", verifyToken, deleteConversation);

export default chatRouter;
