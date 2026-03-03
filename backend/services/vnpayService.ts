import crypto from "crypto";
import type { Request } from "express";
import type { Document } from "mongoose";
import type { ParsedQs } from "qs";

// Minimal Order type interface to avoid circular imports
interface OrderLike extends Document {
    orderNumber?: string;
    _id: any;
    total: number;
}

// Load env vars with trimming to remove any whitespace
const VNPAY_TMN_CODE = (process.env.VNPAY_TMN_CODE || "").trim();
const VNPAY_HASH_SECRET = (process.env.VNPAY_HASH_SECRET || "").trim();
const VNPAY_PAYMENT_URL =
    (process.env.VNPAY_PAYMENT_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html").trim();
const VNPAY_RETURN_URL = (process.env.VNPAY_RETURN_URL || "").trim();
const VNPAY_VERSION = (process.env.VNPAY_VERSION || "2.1.0").trim();
const VNPAY_COMMAND = (process.env.VNPAY_COMMAND || "pay").trim();
const VNPAY_CURR_CODE = (process.env.VNPAY_CURR_CODE || "VND").trim();
const VNPAY_LOCALE = (process.env.VNPAY_LOCALE || "vn").trim();

// Debug: Log env vars on module load (only in development)
// if (process.env.NODE_ENV !== "production") {
//     console.log("VNPay Config Check:", {
//         VNPAY_TMN_CODE: VNPAY_TMN_CODE ? `${VNPAY_TMN_CODE.substring(0, 4)}...` : "❌ MISSING",
//         VNPAY_HASH_SECRET: VNPAY_HASH_SECRET ? "✅ Set" : "❌ MISSING",
//         VNPAY_RETURN_URL: VNPAY_RETURN_URL || "❌ MISSING",
//         VNPAY_PAYMENT_URL: VNPAY_PAYMENT_URL,
//     });
// }

// Helper to get client IP from request
// VNPay requires IPv4 format, not IPv6
const getClientIp = (req: Request): string => {
    const fwd = (req.headers["x-forwarded-for"] as string) || "";
    const remote = req.socket?.remoteAddress || "";
    let ip = (fwd.split(",")[0] || remote || "127.0.0.1").trim();

    // Convert IPv6 localhost (::1) to IPv4 (127.0.0.1)
    if (ip === "::1" || ip === "::ffff:127.0.0.1") {
        ip = "127.0.0.1";
    }

    // If still IPv6, try to extract IPv4 or default to 127.0.0.1
    if (ip.includes("::")) {
        ip = "127.0.0.1";
    }

    return ip;
};

// Build VNPay params for a given order
export const buildVnpParams = (order: OrderLike, req: Request) => {
    // Reload env vars directly to ensure they're up to date
    const tmnCode = (process.env.VNPAY_TMN_CODE || "").trim();
    const hashSecret = (process.env.VNPAY_HASH_SECRET || "").trim();
    const returnUrl = (process.env.VNPAY_RETURN_URL || "").trim();

    // Validate required env vars
    const missingVars: string[] = [];
    if (!tmnCode || tmnCode === "") {
        missingVars.push("VNPAY_TMN_CODE");
    }
    if (!hashSecret || hashSecret === "") {
        missingVars.push("VNPAY_HASH_SECRET");
    }
    if (!returnUrl || returnUrl === "") {
        missingVars.push("VNPAY_RETURN_URL");
    }

    if (missingVars.length > 0) {
        throw new Error(
            `VNPay configuration is missing. Please add the following variables to backend/.env:\n` +
            `${missingVars.join(", ")}\n\n` +
            `Example:\n` +
            `VNPAY_TMN_CODE=YOUR_SANDBOX_TMN_CODE\n` +
            `VNPAY_HASH_SECRET=YOUR_SANDBOX_HASH_SECRET\n` +
            `VNPAY_RETURN_URL=http://localhost:5173/payment/vnpay/result`
        );
    }

    const createDate = new Date();
    const yyyy = createDate.getFullYear().toString();
    const MM = (createDate.getMonth() + 1).toString().padStart(2, "0");
    const dd = createDate.getDate().toString().padStart(2, "0");
    const HH = createDate.getHours().toString().padStart(2, "0");
    const mm = createDate.getMinutes().toString().padStart(2, "0");
    const ss = createDate.getSeconds().toString().padStart(2, "0");
    const vnp_CreateDate = `${yyyy}${MM}${dd}${HH}${mm}${ss}`;

    // vnp_ExpireDate: Bắt buộc theo tài liệu VNPay - thời gian hết hạn thanh toán (GMT+7)
    const expireDate = new Date(createDate.getTime() + 15 * 60 * 1000); // +15 phút
    const vnp_ExpireDate =
        expireDate.getFullYear().toString() +
        (expireDate.getMonth() + 1).toString().padStart(2, "0") +
        expireDate.getDate().toString().padStart(2, "0") +
        expireDate.getHours().toString().padStart(2, "0") +
        expireDate.getMinutes().toString().padStart(2, "0") +
        expireDate.getSeconds().toString().padStart(2, "0");

    // VNPay requires vnp_TxnRef to be max 34 characters
    // Use _id (24 chars) if orderNumber is too long
    let orderRef = order.orderNumber || String(order._id);
    if (orderRef.length > 34) {
        orderRef = String(order._id); // Fallback to _id which is always 24 chars
    }

    // VNPay requires amount in smallest currency unit (VND * 100)
    // Ensure total is a valid number and convert to integer before multiplying
    const totalAmount = Math.round(Number(order.total) || 0);
    if (totalAmount <= 0) {
        throw new Error("Order total must be greater than 0");
    }
    // VNPay minimum amount is 10,000 VND
    if (totalAmount < 10000) {
        throw new Error("Order total must be at least 10,000 VND for VNPay payment");
    }
    // Multiply by 100 to convert to smallest currency unit (no decimal places)
    const vnp_Amount = totalAmount * 100;
    // Convert to string (guaranteed to be integer, no decimal)
    const vnp_AmountStr = String(vnp_Amount);

    // vnp_OrderInfo: max 255 chars
    // Use simple ASCII text without Vietnamese characters to avoid encoding issues
    const orderInfo = `Payment for order ${orderRef}`;
    // Limit to 255 chars if too long
    const vnp_OrderInfo = orderInfo.length > 255 ? orderInfo.substring(0, 252) + "..." : orderInfo;

    const clientIp = getClientIp(req);

    const vnp_Params: Record<string, string> = {
        vnp_Version: VNPAY_VERSION,
        vnp_Command: VNPAY_COMMAND,
        vnp_TmnCode: tmnCode,
        vnp_Amount: vnp_AmountStr,
        vnp_CurrCode: VNPAY_CURR_CODE,
        vnp_TxnRef: orderRef,
        vnp_OrderInfo: vnp_OrderInfo,
        vnp_OrderType: "other",
        vnp_Locale: VNPAY_LOCALE,
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: clientIp,
        vnp_CreateDate,
        vnp_ExpireDate,
    };

    // Remove any empty values (VNPay doesn't accept empty params)
    Object.keys(vnp_Params).forEach((key) => {
        if (!vnp_Params[key] || vnp_Params[key].trim() === "") {
            delete vnp_Params[key];
        }
    });

    // Debug: Log IP address
    if (process.env.NODE_ENV !== "production") {
        console.log("VNPay Client IP:", clientIp);
    }

    return vnp_Params;
};

// Sort params and sign with HMAC SHA512
// Thử theo demo PHP VNPay: hashdata = urlencode(key)."=".urlencode(value)
const signParams = (params: Record<string, string>, hashSecret?: string): string => {
    const secret = hashSecret || VNPAY_HASH_SECRET;
    if (!secret || secret.trim() === "") {
        throw new Error("VNPAY_HASH_SECRET is required for signing");
    }

    const paramsToSign: Record<string, string> = { ...params };
    delete paramsToSign["vnp_SecureHash"];
    delete paramsToSign["vnp_SecureHashType"];

    const sortedKeys = Object.keys(paramsToSign).sort();

    // Demo PHP: urlencode(key)=urlencode(value). PHP urlencode: space -> '+', encodeURIComponent: space -> '%20'
    const phpEncode = (s: string) => encodeURIComponent(s).replace(/%20/g, "+");
    const signData = sortedKeys
        .map((key) => `${phpEncode(key)}=${phpEncode(paramsToSign[key])}`)
        .join("&");

    if (process.env.NODE_ENV !== "production") {
        console.log("VNPay Sign Data (encoded):", signData.substring(0, 120) + "...");
        console.log("VNPay Hash Secret (first 4 chars):", secret.substring(0, 4) + "...");
    }

    const signature = crypto
        .createHmac("sha512", secret)
        .update(signData, "utf8")
        .digest("hex");

    if (process.env.NODE_ENV !== "production") {
        console.log("VNPay Calculated Signature:", signature.substring(0, 32) + "...");
    }

    return signature;
};

export const buildSignedVnpUrl = (params: Record<string, string>, hashSecret?: string): string => {
    const vnp_Params = { ...params };
    const vnp_SecureHash = signParams(vnp_Params, hashSecret);

    const allParams: Record<string, string> = { ...vnp_Params, vnp_SecureHash };
    const sortedKeys = Object.keys(allParams).sort();

    const phpEncodeUrl = (s: string) => encodeURIComponent(s).replace(/%20/g, "+");
    const queryString = sortedKeys
        .map((key) => `${phpEncodeUrl(key)}=${phpEncodeUrl(allParams[key])}`)
        .join("&");

    const finalUrl = `${VNPAY_PAYMENT_URL}?${queryString}`;

    // Debug: Log final URL (truncated) and signature position
    if (process.env.NODE_ENV !== "production") {
        console.log("VNPay Final URL (first 200 chars):", finalUrl.substring(0, 200) + "...");
        console.log("VNPay SecureHash in URL:", vnp_SecureHash.substring(0, 16) + "...");
    }

    return finalUrl;
};

// Verify return params from VNPay
export const verifyVnpReturn = (query: ParsedQs): {
    isValid: boolean;
    orderRef: string | null;
    transactionNo: string | null;
    responseCode: string | null;
} => {
    const queryObj: Record<string, string> = {};

    Object.keys(query).forEach((key) => {
        const value = query[key];
        if (Array.isArray(value)) {
            queryObj[key] = value[0] as string;
        } else if (typeof value === "string") {
            queryObj[key] = value;
        }
    });

    const receivedHash = queryObj["vnp_SecureHash"];
    delete queryObj["vnp_SecureHash"];
    delete queryObj["vnp_SecureHashType"];

    const sortedKeys = Object.keys(queryObj).sort();
    // VNPay ký chuỗi đã URL-encode (giống lúc tạo URL). Dùng cùng cách encode khi verify.
    const phpEncode = (s: string) => encodeURIComponent(s).replace(/%20/g, "+");
    const signData = sortedKeys
        .map((key) => `${phpEncode(key)}=${phpEncode(queryObj[key])}`)
        .join("&");

    const calculatedHash = crypto
        .createHmac("sha512", VNPAY_HASH_SECRET)
        .update(signData, "utf8")
        .digest("hex");

    const isValid =
        !!receivedHash &&
        receivedHash.toString().toLowerCase() === calculatedHash.toLowerCase();

    return {
        isValid,
        orderRef: queryObj["vnp_TxnRef"] || null,
        transactionNo: queryObj["vnp_TransactionNo"] || null,
        responseCode: queryObj["vnp_ResponseCode"] || null,
    };
};


