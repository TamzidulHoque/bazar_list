const crypto = require("crypto"); // built into Node

// Turn a plain password into a safe, salted hash to store in the DB.
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString("hex");        // random per-user salt
    const hash = crypto.scryptSync(password, salt, 64).toString("hex"); // slow one-way hash
    return `${salt}:${hash}`; // store salt + hash together, separated by ":"
}

// Check a login attempt against the stored "salt:hash".
function verifyPassword(password, stored) {
    const [salt, hash] = stored.split(":");
    const attempt = crypto.scryptSync(password, salt, 64).toString("hex");
    return attempt === hash; // true if the password matches
}

module.exports = { hashPassword, verifyPassword };