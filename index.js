const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const pool = require("./db");
const { hashPassword, verifyPassword } = require("./password");
const { createToken, verifyToken } = require("./token");

const PORT = 3000;
const PUBLIC = path.join(__dirname, "public");

// server-side session store: sessionId -> { userId, name }
const sessions = new Map();

// ---------- helpers ----------
function readBody(req) {
    return new Promise((resolve, reject) => {
        let data = "";
        req.on("data", (chunk) => (data += chunk));
        req.on("end", () => resolve(data));
        req.on("error", reject);
    });
}

function sendJson(res, status, data, extraHeaders = {}) {
    res.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
        ...extraHeaders,
    });
    res.end(JSON.stringify(data));
}

// request-এর token যাচাই করে user ফেরত দেয়, না থাকলে null
function getAuthUser(req) {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    return token ? verifyToken(token) : null;
}

// static ফাইল সার্ভ করা (আগের লজিক, এখন একটা ফাংশনে)
function serveStatic(req, res) {
    let requested = req.url === "/" ? "/index.html" : req.url;
    const filePath = path.normalize(path.join(PUBLIC, requested));
    if (!filePath.startsWith(PUBLIC)) {
        res.writeHead(403);
        return res.end("Forbidden");
    }
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
            return res.end("Not found");
        }
        const ext = path.extname(filePath);
        const types = {
            ".html": "text/html; charset=utf-8",
            ".css": "text/css; charset=utf-8",
            ".js": "text/javascript; charset=utf-8",
        };
        res.writeHead(200, { "Content-Type": types[ext] || "text/plain; charset=utf-8" });
        res.end(data);
    });
}

const server = http.createServer(async (req, res) => {
    // ==================== API ROUTES ====================

    // ---- SIGNUP ----
    if (req.url === "/api/signup" && req.method === "POST") {
        let data;
        try { data = JSON.parse(await readBody(req)); }
        catch { return sendJson(res, 400, { error: "ভুল ডেটা" }); }

        const { name, email, password } = data;
        if (!name || !email || !password) {
            return sendJson(res, 400, { error: "name, email, password — সব দরকার" });
        }

        try {
            const hashed = hashPassword(password);
            const result = await pool.query(
                "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
                [name, email, hashed]
            );
            return sendJson(res, 201, { message: "Account তৈরি হয়েছে", user: result.rows[0] });
        } catch (err) {
            if (err.code === "23505") return sendJson(res, 409, { error: "এই email আগেই ব্যবহৃত" });
            console.error(err);
            return sendJson(res, 500, { error: "সার্ভার সমস্যা" });
        }
    }

    // ---- LOGIN ----
    if (req.url === "/api/login" && req.method === "POST") {
        let data;
        try { data = JSON.parse(await readBody(req)); }
        catch { return sendJson(res, 400, { error: "ভুল ডেটা" }); }

        const { email, password } = data;
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        const user = result.rows[0];

        // user নেই বা password ভুল → একই generic message
        if (!user || !verifyPassword(password, user.password)) {
            return sendJson(res, 401, { error: "Email বা password ভুল" });
        }
        if (!user.is_active) {
            return sendJson(res, 403, { error: "আপনার account বন্ধ করা হয়েছে" });
        }

        // session বানাই
        const sessionId = crypto.randomBytes(16).toString("hex");
        sessions.set(sessionId, { userId: user.id, name: user.name });

        // JWT বানাই
        const token = createToken({ userId: user.id, name: user.name, email: user.email });

        return sendJson(res, 200,
            { message: "Login সফল", token, user: { id: user.id, name: user.name, email: user.email } },
            { "Set-Cookie": `sessionId=${sessionId}; HttpOnly; Path=/` }
        );
    }

    // ---- SAVE ITEMS (protected) ----
    // ---- SAVE ITEMS (protected) — account list-কে current list দিয়ে replace ----
    if (req.url === "/api/items/save" && req.method === "POST") {
        const user = getAuthUser(req);
        if (!user) return sendJson(res, 401, { error: "আগে login করুন" });

        let data;
        try { data = JSON.parse(await readBody(req)); }
        catch { return sendJson(res, 400, { error: "ভুল ডেটা" }); }

        const list = Array.isArray(data.items) ? data.items : [];

        try {
            // আগের সব মুছি, তারপর current list বসাই → duplicate হবে না
            await pool.query("DELETE FROM items WHERE user_id = $1", [user.userId]);
            let count = 0;
            for (const title of list) {
                if (title && title.trim()) {
                    await pool.query(
                        "INSERT INTO items (user_id, title) VALUES ($1, $2)",
                        [user.userId, title.trim()]
                    );
                    count++;
                }
            }
            return sendJson(res, 200, { message: "সেভ হয়েছে", count });
        } catch (err) {
            console.error(err);
            return sendJson(res, 500, { error: "সার্ভার সমস্যা" });
        }
    }

    // ---- ME (token দিয়ে সুরক্ষিত — টেস্টের জন্য) ----
    if (req.url === "/api/me" && req.method === "GET") {
        const auth = req.headers.authorization || "";
        const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
        const payload = token && verifyToken(token);
        if (!payload) return sendJson(res, 401, { error: "Invalid বা missing token" });
        return sendJson(res, 200, { user: payload });
    }

    // ---- GET ITEMS (protected) ----
    if (req.url === "/api/items" && req.method === "GET") {
        const user = getAuthUser(req);
        if (!user) return sendJson(res, 401, { error: "আগে login করুন" });

        try {
            const result = await pool.query(
                "SELECT title FROM items WHERE user_id = $1 ORDER BY id",
                [user.userId]
            );
            return sendJson(res, 200, { items: result.rows });
        } catch (err) {
            console.error(err);
            return sendJson(res, 500, { error: "সার্ভার সমস্যা" });
        }
    }

    // ---- CHANGE PASSWORD (protected) ----
    if (req.url === "/api/change-password" && req.method === "POST") {
        const authUser = getAuthUser(req);
        if (!authUser) return sendJson(res, 401, { error: "আগে login করুন" });

        let data;
        try { data = JSON.parse(await readBody(req)); }
        catch { return sendJson(res, 400, { error: "ভুল ডেটা" }); }

        const { currentPassword, newPassword } = data;
        if (!currentPassword || !newPassword) {
            return sendJson(res, 400, { error: "বর্তমান ও নতুন password দুটোই দরকার" });
        }

        // DB থেকে user আনি
        const result = await pool.query("SELECT * FROM users WHERE id = $1", [authUser.userId]);
        const user = result.rows[0];
        if (!user) return sendJson(res, 404, { error: "User পাওয়া যায়নি" });

        // বর্তমান password যাচাই
        if (!verifyPassword(currentPassword, user.password)) {
            return sendJson(res, 401, { error: "বর্তমান password ভুল" });
        }

        // নতুন password hash করে UPDATE
        const hashed = hashPassword(newPassword);
        await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashed, user.id]);

        return sendJson(res, 200, { message: "Password বদলেছে" });
    }

    // ==================== STATIC FILES ====================
    serveStatic(req, res);
});




server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
