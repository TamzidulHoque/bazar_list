const crypto = require("crypto");

// The secret used to sign tokens. Anyone with this can forge tokens — keep it private.
const SECRET = "change-this-to-a-long-random-secret";

// base64url = base64 but safe for URLs/headers (no +, /, or = characters).
function base64url(input) {
    return Buffer.from(input)
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
}

// Sign "header.payload" with our secret to produce the signature.
function sign(data) {
    return crypto.createHmac("sha256", SECRET).update(data).digest("base64")
        .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

// Build a token from a payload object (e.g. { userId, username }).
function createToken(payload) {
    const header = { alg: "HS256", typ: "JWT" };
    // Add an expiry: 1 hour from now (in seconds).
    const body = { ...payload, exp: Math.floor(Date.now() / 1000) + 3600 };

    const headerPart = base64url(JSON.stringify(header));
    const payloadPart = base64url(JSON.stringify(body));
    const data = `${headerPart}.${payloadPart}`;

    return `${data}.${sign(data)}`; // header.payload.signature
}

// Verify a token. Returns the payload if valid, or null if not.
function verifyToken(token) {
    const parts = (token || "").split(".");
    if (parts.length !== 3) return null;

    const [headerPart, payloadPart, signature] = parts;
    const data = `${headerPart}.${payloadPart}`;

    // 1) Is the signature genuine? Recompute and compare.
    if (sign(data) !== signature) return null; // tampered or wrong secret

    // 2) Decode the payload.
    const payload = JSON.parse(Buffer.from(payloadPart, "base64").toString());

    // 3) Expired?
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
}

module.exports = { createToken, verifyToken };