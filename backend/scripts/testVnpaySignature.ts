/**
 * Script to test VNPay signature calculation
 * Run: npx ts-node backend/scripts/testVnpaySignature.ts
 */

import crypto from "crypto";
import dotenv from "dotenv";
import path from "path";

// Load .env from project root
dotenv.config({ path: path.join(__dirname, "../.env") });

const VNPAY_HASH_SECRET = (process.env.VNPAY_HASH_SECRET || "").trim();

if (!VNPAY_HASH_SECRET) {
    console.error("❌ VNPAY_HASH_SECRET is not set in .env");
    process.exit(1);
}

// Test params from your log
const testParams: Record<string, string> = {
    vnp_Amount: "849000000",
    vnp_Command: "pay",
    vnp_CreateDate: "20260203232344",
    vnp_CurrCode: "VND",
    vnp_IpAddr: "127.0.0.1",
    vnp_Locale: "vn",
    vnp_OrderInfo: "Payment for order TS-20260203-232344-9435",
    vnp_OrderType: "other",
    vnp_ReturnUrl: "http://localhost:5173/payment/vnpay/result",
    vnp_TmnCode: "GHOS8N5A",
    vnp_TxnRef: "TS-20260203-232344-9435",
    vnp_Version: "2.1.0",
};

// Remove vnp_SecureHash if present
delete testParams["vnp_SecureHash"];
delete testParams["vnp_SecureHashType"];

// Sort keys alphabetically
const sortedKeys = Object.keys(testParams).sort();

// Build sign data string WITHOUT encoding values
const signData = sortedKeys.map((key) => `${key}=${testParams[key]}`).join("&");

console.log("=== VNPay Signature Test ===\n");
console.log("Hash Secret (first 8 chars):", VNPAY_HASH_SECRET.substring(0, 8) + "...");
console.log("Hash Secret length:", VNPAY_HASH_SECRET.length);
console.log("\nSign Data:");
console.log(signData);
console.log("\nSign Data Length:", signData.length);

// Calculate signature
const signature = crypto.createHmac("sha512", VNPAY_HASH_SECRET).update(signData, "utf8").digest("hex");

console.log("\nCalculated Signature:");
console.log(signature);
console.log("\nExpected Signature (from your log):");
console.log("d9f2ace15b66192cd3ed5fa57415c940894d14f4cf6656ab4379c73ed188db950fb1efff2d511f4224f42232eed70c2def2cabfbe69b05ca1aee3a357b67fbfd");

console.log("\n=== Comparison ===");
const expectedSig = "d9f2ace15b66192cd3ed5fa57415c940894d14f4cf6656ab4379c73ed188db950fb1efff2d511f4224f42232eed70c2def2cabfbe69b05ca1aee3a357b67fbfd";
if (signature.toLowerCase() === expectedSig.toLowerCase()) {
    console.log("✅ Signature MATCHES! Your Hash Secret is correct.");
} else {
    console.log("❌ Signature DOES NOT MATCH!");
    console.log("This means your VNPAY_HASH_SECRET in .env is incorrect.");
    console.log("\nPlease check:");
    console.log("1. Go to https://sandbox.vnpayment.vn/");
    console.log("2. Login and go to 'Thông tin kết nối' or 'Cấu hình'");
    console.log("3. Copy the HashSecret (vnp_HashSecret)");
    console.log("4. Update VNPAY_HASH_SECRET in backend/.env");
    console.log("5. Restart backend");
}

