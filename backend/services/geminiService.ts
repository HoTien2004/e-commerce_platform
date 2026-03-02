import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || "").trim();
// Tên model: gemini-1.5-flash-002, gemini-1.5-pro-002, gemini-2.0-flash... (gemini-1.5-flash không còn dùng cho v1beta)
const MODEL_NAME = process.env.GEMINI_CHAT_MODEL || "gemini-1.5-flash-002";

export interface ChatMessage {
    role: "user" | "model";
    text: string;
}

/**
 * Gửi tin nhắn tới Gemini với lịch sử hội thoại (context).
 * History chỉ dùng để model hiểu ngữ cảnh, không hiển thị phần "gán" ở FE.
 */
export async function sendChatWithHistory(
    userMessage: string,
    history: ChatMessage[]
): Promise<string> {
    if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not set in environment");
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        systemInstruction: `Bạn là trợ lý ảo của HDQTShop - cửa hàng công nghệ chuyên laptop, PC, màn hình và phụ kiện. 
Trả lời ngắn gọn, thân thiện bằng tiếng Việt. Hỗ trợ khách hàng về sản phẩm, đơn hàng, chính sách đổi trả và hướng dẫn mua hàng. 
Nếu không chắc chắn, gợi ý khách liên hệ hotline hoặc Zalo.`,
    });

    // Chuyển history từ DB (role, text) sang format Gemini (role, parts: [{ text }])
    const geminiHistory = history.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.text }],
    }));

    const chat = model.startChat({
        history: geminiHistory,
    });

    const result = await chat.sendMessage(userMessage);
    const response = result.response;
    const text = response.text();
    return text || "";
}
