import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import Database from "better-sqlite3";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const app = express();
const __dirnamePath = path.resolve();
const dataDir = path.join(__dirnamePath, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const db = new Database(path.join(dataDir, "db.sqlite"));
const JWT_SECRET = process.env.JWT_SECRET || "digital-soko-dev-secret-12345";

app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirnamePath));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    is_admin INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    original_user_id INTEGER,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    condition TEXT,
    price INTEGER NOT NULL,
    type TEXT NOT NULL,
    img TEXT,
    external_source TEXT,
    external_id TEXT,
    status TEXT NOT NULL DEFAULT 'Available',
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    requester_user_id INTEGER NOT NULL,
    owner_user_id INTEGER NOT NULL,
    requested_item_id INTEGER NOT NULL,
    offered_item_id INTEGER,
    is_full_topup INTEGER NOT NULL,
    topup_amount INTEGER,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(requester_user_id) REFERENCES users(id),
    FOREIGN KEY(owner_user_id) REFERENCES users(id),
    FOREIGN KEY(requested_item_id) REFERENCES items(id),
    FOREIGN KEY(offered_item_id) REFERENCES items(id)
  );
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trade_id INTEGER,
    sender_user_id INTEGER NOT NULL,
    recipient_user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL,
    is_admin_message INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY(trade_id) REFERENCES trades(id) ON DELETE CASCADE,
    FOREIGN KEY(sender_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(recipient_user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS disputes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trade_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Open',
    winner_user_id INTEGER,
    resolution_message TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(trade_id) REFERENCES trades(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(winner_user_id) REFERENCES users(id) ON DELETE SET NULL
  );
`);

// Migrate users table to add is_admin if missing (for existing DBs)
try {
  const cols = db.prepare("PRAGMA table_info(users)").all();
  const hasAdmin = cols.some(c => c.name === "is_admin");
  if (!hasAdmin) {
    db.prepare("ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0").run();
  }
} catch {}

try {
  const itemCols = db.prepare("PRAGMA table_info(items)").all();
  const hasExternalSource = itemCols.some(c => c.name === "external_source");
  const hasExternalId = itemCols.some(c => c.name === "external_id");
  const hasOriginal = itemCols.some(c => c.name === "original_user_id");
  const hasStatus = itemCols.some(c => c.name === "status");
  if (!hasExternalSource) db.prepare("ALTER TABLE items ADD COLUMN external_source TEXT").run();
  if (!hasExternalId) db.prepare("ALTER TABLE items ADD COLUMN external_id TEXT").run();
  if (!hasOriginal) db.prepare("ALTER TABLE items ADD COLUMN original_user_id INTEGER").run();
  if (!hasStatus) db.prepare("ALTER TABLE items ADD COLUMN status TEXT NOT NULL DEFAULT 'Available'").run();
  db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_items_external ON items(external_source, external_id)").run();
} catch {}

try {
  const disputeCols = db.prepare("PRAGMA table_info(disputes)").all();
  const hasWinner = disputeCols.some(c => c.name === "winner_user_id");
  const hasResolution = disputeCols.some(c => c.name === "resolution_message");
  if (!hasWinner) db.prepare("ALTER TABLE disputes ADD COLUMN winner_user_id INTEGER").run();
  if (!hasResolution) db.prepare("ALTER TABLE disputes ADD COLUMN resolution_message TEXT").run();
} catch {}

// Migration: Allow NULL trade_id in messages table
try {
  const info = db.prepare("PRAGMA table_info(messages)").all();
  const tradeIdCol = info.find(c => c.name === 'trade_id');
  if (tradeIdCol && tradeIdCol.notnull === 1) {
    console.log("Migrating messages table to allow NULL trade_id...");
    db.transaction(() => {
      db.prepare("CREATE TABLE messages_new (id INTEGER PRIMARY KEY AUTOINCREMENT, trade_id INTEGER, sender_user_id INTEGER NOT NULL, recipient_user_id INTEGER NOT NULL, content TEXT NOT NULL, created_at TEXT NOT NULL, FOREIGN KEY(trade_id) REFERENCES trades(id) ON DELETE CASCADE, FOREIGN KEY(sender_user_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY(recipient_user_id) REFERENCES users(id) ON DELETE CASCADE)").run();
      db.prepare("INSERT INTO messages_new SELECT * FROM messages").run();
      db.prepare("DROP TABLE messages").run();
      db.prepare("ALTER TABLE messages_new RENAME TO messages").run();
    })();
  }
} catch (e) {
  console.error("Migration failed:", e);
}

// Seed admin user
try {
  const adminEmail = "admin@digitalsoko.test";
  const existing = db.prepare("SELECT id FROM users WHERE email=?").get(adminEmail);
  if (!existing) {
    const now = new Date().toISOString();
    const hash = bcrypt.hashSync("admin123", 10);
    db.prepare("INSERT INTO users (name,email,password_hash,is_admin,created_at) VALUES (?,?,?,?,?)")
      .run("Admin", adminEmail, hash, 1, now);
  }
} catch {}

function signToken(user) {
  return jwt.sign({ sub: user.id, name: user.name, email: user.email, is_admin: user.is_admin ? 1 : 0 }, JWT_SECRET, { expiresIn: "7d" });
}

function auth(req, res, next) {
  const h = req.headers.authorization || "";
  const m = h.match(/^Bearer (.+)$/);
  if (!m) return res.status(401).json({ error: "Unauthorized" });
  try {
    const payload = jwt.verify(m[1], JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
}

app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "Invalid" });
  const exists = db.prepare("SELECT id FROM users WHERE email=?").get(email);
  if (exists) return res.status(409).json({ error: "Exists" });
  const hash = bcrypt.hashSync(password, 10);
  const now = new Date().toISOString();
  const info = db.prepare("INSERT INTO users (name,email,password_hash,is_admin,created_at) VALUES (?,?,?,?,?)").run(name, email, hash, 0, now);
  const user = { id: info.lastInsertRowid, name, email, is_admin: 0 };
  const token = signToken(user);
  res.json({ token, user });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email=?").get(email);
  if (!user) return res.status(401).json({ error: "Invalid" });
  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid" });
  const token = signToken(user);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, is_admin: user.is_admin } });
});

app.get("/api/users/me", auth, (req, res) => {
  const u = db.prepare("SELECT id,name,email,is_admin FROM users WHERE id=?").get(req.userId);
  res.json(u);
});

app.get("/api/items", (req, res) => {
  const items = db.prepare("SELECT items.*, users.name as owner_name FROM items JOIN users ON users.id=items.user_id ORDER BY items.created_at DESC").all();
  res.json(items);
});

app.get("/api/items/mine", auth, (req, res) => {
  const items = db.prepare("SELECT * FROM items WHERE user_id=? ORDER BY created_at DESC").all(req.userId);
  res.json(items);
});

app.post("/api/items", auth, (req, res) => {
  const { name, description, category, condition, price, type, img } = req.body;
  if (!name || !price || !type) return res.status(400).json({ error: "Invalid" });
  const now = new Date().toISOString();
  const info = db.prepare("INSERT INTO items (user_id,original_user_id,name,description,category,condition,price,type,img,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)")
    .run(req.userId, req.userId, name, description || "", category || "", condition || "", parseInt(price, 10) || 0, type, img || "", 'Available', now);
  const item = db.prepare("SELECT * FROM items WHERE id=?").get(info.lastInsertRowid);
  res.json(item);
});

app.delete("/api/items/:id", auth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const item = db.prepare("SELECT * FROM items WHERE id=?").get(id);
  if (!item || item.user_id !== req.userId) return res.status(404).json({ error: "NotFound" });
  db.prepare("DELETE FROM items WHERE id=?").run(id);
  res.json({ ok: true });
});

app.patch("/api/items/:id", auth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const current = db.prepare("SELECT * FROM items WHERE id=?").get(id);
  if (!current || current.user_id !== req.userId) return res.status(404).json({ error: "NotFound" });
  const { name, description, category, condition, price, type, img } = req.body;
  const newName = name ?? current.name;
  const newDesc = description ?? current.description;
  const newCat = category ?? current.category;
  const newCond = condition ?? current.condition;
  const newPrice = price != null ? parseInt(price, 10) || 0 : current.price;
  const newType = type ?? current.type;
  const newImg = img ?? current.img;
  db.prepare("UPDATE items SET name=?, description=?, category=?, condition=?, price=?, type=?, img=? WHERE id=?")
    .run(newName, newDesc, newCat, newCond, newPrice, newType, newImg, id);
  const updated = db.prepare("SELECT * FROM items WHERE id=?").get(id);
  res.json(updated);
});

app.post("/api/trades", auth, (req, res) => {
  const { requested_item_id, offered_item_id, full_topup } = req.body;
  const requested = db.prepare("SELECT * FROM items WHERE id=?").get(requested_item_id);
  if (!requested) return res.status(400).json({ error: "InvalidRequested" });
  const owner = requested.user_id;
  let isFullTopup = full_topup ? 1 : 0;
  let topup = null;
  if (offered_item_id) {
    const offered = db.prepare("SELECT * FROM items WHERE id=? AND user_id=?").get(offered_item_id, req.userId);
    if (!offered) return res.status(400).json({ error: "InvalidOffered" });
    topup = Math.max(0, requested.price - offered.price);
    isFullTopup = 0;
  }
  if (!offered_item_id && !isFullTopup) return res.status(400).json({ error: "InvalidOffer" });
  const now = new Date().toISOString();
  const info = db.prepare("INSERT INTO trades (requester_user_id,owner_user_id,requested_item_id,offered_item_id,is_full_topup,topup_amount,status,created_at) VALUES (?,?,?,?,?,?,?,?)")
    .run(req.userId, owner, requested_item_id, offered_item_id || null, isFullTopup, topup, "Pending", now);
  const trade = db.prepare("SELECT * FROM trades WHERE id=?").get(info.lastInsertRowid);
  res.json(trade);
});

app.get("/api/trades/incoming", auth, (req, res) => {
  const sql = `
    SELECT t.*, 
      ri.name AS requested_name, ri.price AS requested_price, ri.img AS requested_img, ri.description AS requested_description,
      oi.name AS offered_name, oi.price AS offered_price, oi.img AS offered_img, oi.description AS offered_description,
      u_req.name AS requester_name, u_owner.name AS owner_name
    FROM trades t
    JOIN items ri ON ri.id = t.requested_item_id
    LEFT JOIN items oi ON oi.id = t.offered_item_id
    JOIN users u_req ON u_req.id = t.requester_user_id
    JOIN users u_owner ON u_owner.id = t.owner_user_id
    WHERE t.owner_user_id = ?
    ORDER BY t.created_at DESC`;
  const trades = db.prepare(sql).all(req.userId);
  res.json(trades);
});

app.get("/api/trades/mine", auth, (req, res) => {
  const sql = `
    SELECT t.*, 
      ri.name AS requested_name, ri.price AS requested_price, ri.img AS requested_img, ri.description AS requested_description,
      oi.name AS offered_name, oi.price AS offered_price, oi.img AS offered_img, oi.description AS offered_description,
      u_req.name AS requester_name, u_owner.name AS owner_name
    FROM trades t
    JOIN items ri ON ri.id = t.requested_item_id
    LEFT JOIN items oi ON oi.id = t.offered_item_id
    JOIN users u_req ON u_req.id = t.requester_user_id
    JOIN users u_owner ON u_owner.id = t.owner_user_id
    WHERE t.owner_user_id = ? OR t.requester_user_id = ?
    ORDER BY t.created_at DESC`;
  const trades = db.prepare(sql).all(req.userId, req.userId);
  res.json(trades);
});

app.get("/api/items/sold-by-me", auth, (req, res) => {
  const sql = `
    SELECT i.*, (
      SELECT t.id FROM trades t
      WHERE t.requested_item_id = i.id AND t.owner_user_id = i.original_user_id AND t.status='Accepted'
      ORDER BY t.created_at DESC LIMIT 1
    ) AS last_trade_id
    FROM items i
    WHERE i.original_user_id=? AND i.status='Sold'
    ORDER BY i.created_at DESC`;
  const rows = db.prepare(sql).all(req.userId);
  res.json(rows);
});

app.post("/api/trades/:id/accept", auth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const t = db.prepare("SELECT * FROM trades WHERE id=?").get(id);
  if (!t || t.owner_user_id !== req.userId) return res.status(404).json({ error: "NotFound" });
  const requested = db.prepare("SELECT * FROM items WHERE id=?").get(t.requested_item_id);
  const offered = t.offered_item_id ? db.prepare("SELECT * FROM items WHERE id=?").get(t.offered_item_id) : null;
  if (!requested || requested.user_id !== t.owner_user_id) return res.status(400).json({ error: "InvalidRequestedOwner" });
  if (offered && offered.user_id !== t.requester_user_id) return res.status(400).json({ error: "InvalidOfferedOwner" });
  const tx = db.transaction(() => {
    if (offered) {
      db.prepare("UPDATE items SET user_id=? WHERE id=?").run(t.requester_user_id, t.requested_item_id);
      db.prepare("UPDATE items SET user_id=? WHERE id=?").run(t.owner_user_id, t.offered_item_id);
      db.prepare("UPDATE items SET status='Sold' WHERE id=?").run(t.requested_item_id);
    } else if (t.is_full_topup) {
      db.prepare("UPDATE items SET user_id=? WHERE id=?").run(t.requester_user_id, t.requested_item_id);
      db.prepare("UPDATE items SET status='Sold' WHERE id=?").run(t.requested_item_id);
    }
    db.prepare("UPDATE trades SET status='Accepted' WHERE id=?").run(id);
  });
  tx();
  res.json({ ok: true });
});

app.post("/api/trades/:id/decline", auth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const t = db.prepare("SELECT * FROM trades WHERE id=?").get(id);
  if (!t || t.owner_user_id !== req.userId) return res.status(404).json({ error: "NotFound" });
  db.prepare("UPDATE trades SET status='Declined' WHERE id=?").run(id);
  res.json({ ok: true });
});

app.post("/api/trades/:id/recall", auth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const t = db.prepare("SELECT * FROM trades WHERE id=?").get(id);
  if (!t || t.owner_user_id !== req.userId || t.status !== 'Accepted') return res.status(404).json({ error: "NotFound" });
  const requested = db.prepare("SELECT * FROM items WHERE id=?").get(t.requested_item_id);
  const offered = t.offered_item_id ? db.prepare("SELECT * FROM items WHERE id=?").get(t.offered_item_id) : null;
  const tx = db.transaction(() => {
    if (offered) {
      db.prepare("UPDATE items SET user_id=? WHERE id=?").run(t.owner_user_id, t.requested_item_id);
      db.prepare("UPDATE items SET user_id=? WHERE id=?").run(t.requester_user_id, t.offered_item_id);
      db.prepare("UPDATE items SET status='Available' WHERE id=?").run(t.requested_item_id);
    } else if (t.is_full_topup) {
      db.prepare("UPDATE items SET user_id=? WHERE id=?").run(t.owner_user_id, t.requested_item_id);
      db.prepare("UPDATE items SET status='Recalled' WHERE id=?").run(t.requested_item_id);
    }
    db.prepare("UPDATE trades SET status='Recalled' WHERE id=?").run(id);
    const now = new Date().toISOString();
    db.prepare("INSERT INTO messages (trade_id,sender_user_id,recipient_user_id,content,created_at) VALUES (?,?,?,?,?)")
      .run(id, req.userId, t.requester_user_id, "The item has been recalled by the seller. Ownership and value returned.", now);
  });
  tx();
  res.json({ ok: true });
});

app.get("/api/messages/:tradeId", auth, (req, res) => {
  const tradeId = parseInt(req.params.tradeId, 10);
  const t = db.prepare("SELECT * FROM trades WHERE id=?").get(tradeId);
  if (!t || (t.owner_user_id !== req.userId && t.requester_user_id !== req.userId)) return res.status(404).json({ error: "NotFound" });
  const msgs = db.prepare(`
    SELECT m.*, u.name AS sender_name
    FROM messages m
    JOIN users u ON u.id = m.sender_user_id
    WHERE m.trade_id = ?
    ORDER BY m.created_at ASC
  `).all(tradeId);
  res.json(msgs);
});

app.get("/api/trades/:id", auth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const sql = `
    SELECT t.*, 
      ri.name AS requested_name, ri.price AS requested_price, ri.img AS requested_img, ri.description AS requested_description,
      oi.name AS offered_name, oi.price AS offered_price, oi.img AS offered_img, oi.description AS offered_description,
      u_req.name AS requester_name, u_owner.name AS owner_name
    FROM trades t
    JOIN items ri ON ri.id = t.requested_item_id
    LEFT JOIN items oi ON oi.id = t.offered_item_id
    JOIN users u_req ON u_req.id = t.requester_user_id
    JOIN users u_owner ON u_owner.id = t.owner_user_id
    WHERE t.id = ?`;
  const row = db.prepare(sql).get(id);
  if (!row || (row.owner_user_id !== req.userId && row.requester_user_id !== req.userId)) return res.status(404).json({ error: "NotFound" });
  res.json(row);
});

app.post("/api/messages/:tradeId", auth, (req, res) => {
  const tradeId = parseInt(req.params.tradeId, 10);
  const { content } = req.body;
  const t = db.prepare("SELECT * FROM trades WHERE id=?").get(tradeId);
  if (!t || (t.owner_user_id !== req.userId && t.requester_user_id !== req.userId)) return res.status(404).json({ error: "NotFound" });
  const recipient = t.owner_user_id === req.userId ? t.requester_user_id : t.owner_user_id;
  const now = new Date().toISOString();
  db.prepare("INSERT INTO messages (trade_id,sender_user_id,recipient_user_id,content,created_at) VALUES (?,?,?,?,?)").run(tradeId, req.userId, recipient, content, now);
  res.json({ ok: true });
});

app.patch("/api/users/me", auth, (req, res) => {
  const { name, old_password, new_password } = req.body;
  const u = db.prepare("SELECT * FROM users WHERE id=?").get(req.userId);
  if (!u) return res.status(404).json({ error: "NotFound" });
  let newHash = u.password_hash;
  if (new_password) {
    if (!old_password || !bcrypt.compareSync(old_password, u.password_hash)) {
      return res.status(400).json({ error: "InvalidOldPassword" });
    }
    newHash = bcrypt.hashSync(new_password, 10);
  }
  const newName = name || u.name;
  db.prepare("UPDATE users SET name=?, password_hash=? WHERE id=?").run(newName, newHash, req.userId);
  res.json({ id: req.userId, name: newName, email: u.email, is_admin: u.is_admin });
});

function requireAdmin(req, res, next) {
  console.log("requireAdmin check for userId:", req.userId);
  const u = db.prepare("SELECT is_admin FROM users WHERE id=?").get(req.userId);
  console.log("User from DB:", u);
  if (!u || !u.is_admin) return res.status(403).json({ error: "Forbidden" });
  next();
}

app.get("/api/admin/stats", auth, requireAdmin, (req, res) => {
  const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users").get().count;
  const totalItems = db.prepare("SELECT COUNT(*) as count FROM items").get().count;
  const totalTrades = db.prepare("SELECT COUNT(*) as count FROM trades").get().count;
  res.json({ totalUsers, totalItems, totalTrades });
});

app.get("/api/admin/users", auth, requireAdmin, (req, res) => {
  const users = db.prepare("SELECT id, name, email, created_at FROM users").all();
  res.json(users);
});

app.get("/api/admin/items", auth, requireAdmin, (req, res) => {
  const items = db.prepare("SELECT i.*, u.name as owner_name FROM items i JOIN users u ON u.id = i.user_id").all();
  res.json(items);
});

app.get("/api/admin/trades", auth, requireAdmin, (req, res) => {
  const sql = `
    SELECT t.*, 
      ri.name AS requested_name,
      oi.name AS offered_name,
      u_req.name AS requester_name,
      u_owner.name AS owner_name
    FROM trades t
    JOIN items ri ON ri.id = t.requested_item_id
    LEFT JOIN items oi ON oi.id = t.offered_item_id
    JOIN users u_req ON u_req.id = t.requester_user_id
    JOIN users u_owner ON u_owner.id = t.owner_user_id
    ORDER BY t.created_at DESC`;
  const trades = db.prepare(sql).all();
  res.json(trades);
});

app.post("/api/admin/trades/:id/cancel", auth, requireAdmin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { message } = req.body;
  const t = db.prepare("SELECT * FROM trades WHERE id=?").get(id);
  if (!t) return res.status(404).json({ error: "NotFound" });
  
  const now = new Date().toISOString();
  const tx = db.transaction(() => {
    db.prepare("UPDATE trades SET status='Cancelled' WHERE id=?").run(id);
    if (message) {
      db.prepare("INSERT INTO messages (trade_id, sender_user_id, recipient_user_id, content, created_at, is_admin_message) VALUES (?,?,?,?,?,?)").run(id, req.userId, t.requester_user_id, message, now, 1);
      db.prepare("INSERT INTO messages (trade_id, sender_user_id, recipient_user_id, content, created_at, is_admin_message) VALUES (?,?,?,?,?,?)").run(id, req.userId, t.owner_user_id, message, now, 1);
    }
  });
  tx();
  res.json({ ok: true });
});

app.delete("/api/admin/users/:id", auth, requireAdmin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const tx = db.transaction(() => {
    // Delete messages where user is sender or recipient
    db.prepare("DELETE FROM messages WHERE sender_user_id = ? OR recipient_user_id = ?").run(id, id);
    // Delete disputes
    db.prepare("DELETE FROM disputes WHERE user_id = ?").run(id);
    // Delete trades involving the user
    db.prepare("DELETE FROM trades WHERE requester_user_id = ? OR owner_user_id = ?").run(id, id);
    // Delete items owned by the user
    db.prepare("DELETE FROM items WHERE user_id = ?").run(id);
    // Finally delete the user
    db.prepare("DELETE FROM users WHERE id = ?").run(id);
  });
  tx();
  res.json({ ok: true });
});

app.delete("/api/admin/items/:id", auth, requireAdmin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const tx = db.transaction(() => {
    // Delete trades involving this item
    db.prepare("DELETE FROM trades WHERE requested_item_id = ? OR offered_item_id = ?").run(id, id);
    // Delete the item
    db.prepare("DELETE FROM items WHERE id = ?").run(id);
  });
  tx();
  res.json({ ok: true });
});

app.post("/api/disputes", auth, (req, res) => {
  const { trade_id, reason } = req.body;
  const trade = db.prepare("SELECT * FROM trades WHERE id = ?").get(trade_id);
  if (!trade) return res.status(404).json({ error: "TradeNotFound" });
  
  if (trade.requester_user_id !== req.userId && trade.owner_user_id !== req.userId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  if (trade.status !== 'Accepted') {
    return res.status(400).json({ error: "Only accepted trades can be disputed" });
  }

  const existing = db.prepare("SELECT id FROM disputes WHERE trade_id = ? AND user_id = ?").get(trade_id, req.userId);
  if (existing) return res.status(409).json({ error: "Dispute already exists" });

  const now = new Date().toISOString();
  db.prepare("INSERT INTO disputes (trade_id, user_id, reason, created_at) VALUES (?, ?, ?, ?)").run(trade_id, req.userId, reason, now);
  res.json({ ok: true });
});

app.get("/api/admin/disputes", auth, requireAdmin, (req, res) => {
  const disputes = db.prepare("SELECT d.*, t.id as trade_id, u.name as user_name, t.requester_user_id, t.owner_user_id FROM disputes d JOIN trades t ON t.id = d.trade_id JOIN users u ON u.id = d.user_id").all();
  res.json(disputes);
});

app.patch("/api/admin/disputes/:id/resolve", auth, requireAdmin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { message, winner_user_id } = req.body;

  const dispute = db.prepare("SELECT * FROM disputes WHERE id = ?").get(id);
  if (!dispute) return res.status(404).json({ error: "DisputeNotFound" });

  const trade = db.prepare("SELECT * FROM trades WHERE id = ?").get(dispute.trade_id);
  if (!trade) return res.status(404).json({ error: "TradeNotFound" });

  const now = new Date().toISOString();
  const tx = db.transaction(() => {
    db.prepare("UPDATE disputes SET status='Resolved', winner_user_id=?, resolution_message=? WHERE id=?").run(winner_user_id, message, id);
    if (message) {
      db.prepare("INSERT INTO messages (trade_id, sender_user_id, recipient_user_id, content, created_at, is_admin_message) VALUES (?, ?, ?, ?, ?, ?)").run(dispute.trade_id, req.userId, trade.requester_user_id, `Dispute resolved. Resolution: ${message}`, now, 1);
      db.prepare("INSERT INTO messages (trade_id, sender_user_id, recipient_user_id, content, created_at, is_admin_message) VALUES (?, ?, ?, ?, ?, ?)").run(dispute.trade_id, req.userId, trade.owner_user_id, `Dispute resolved. Resolution: ${message}`, now, 1);
    }
  });

  tx();
  res.json({ ok: true });
});

app.post("/api/admin/trades/:id/reverse", auth, requireAdmin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { message } = req.body;
  const trade = db.prepare("SELECT * FROM trades WHERE id = ?").get(id);
  if (!trade) return res.status(404).json({ error: "TradeNotFound" });

  const now = new Date().toISOString();
  const tx = db.transaction(() => {
    db.prepare("UPDATE items SET user_id = ? WHERE id = ?").run(trade.owner_user_id, trade.requested_item_id);
    if (trade.offered_item_id) {
      db.prepare("UPDATE items SET user_id = ? WHERE id = ?").run(trade.requester_user_id, trade.offered_item_id);
    }
    db.prepare("UPDATE trades SET status = 'Reversed' WHERE id = ?").run(id);
    if (message) {
      db.prepare("INSERT INTO messages (trade_id, sender_user_id, recipient_user_id, content, created_at, is_admin_message) VALUES (?,?,?,?,?,?)").run(id, req.userId, trade.requester_user_id, message, now, 1);
      db.prepare("INSERT INTO messages (trade_id, sender_user_id, recipient_user_id, content, created_at, is_admin_message) VALUES (?,?,?,?,?,?)").run(id, req.userId, trade.owner_user_id, message, now, 1);
    }
  });

  tx();
  res.json({ ok: true });
});

app.get("/api/admin/disputes/:id", auth, requireAdmin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const dispute = db.prepare("SELECT d.*, u.name as winner_name FROM disputes d LEFT JOIN users u ON u.id = d.winner_user_id WHERE d.id = ?").get(id);
  if (!dispute) return res.status(404).json({ error: "DisputeNotFound" });

  const trade = db.prepare("SELECT t.*, ri.name as requested_item_name, oi.name as offered_item_name, u_req.name as requester_name, u_owner.name as owner_name FROM trades t LEFT JOIN items ri ON ri.id = t.requested_item_id LEFT JOIN items oi ON oi.id = t.offered_item_id JOIN users u_req ON u_req.id = t.requester_user_id JOIN users u_owner ON u_owner.id = t.owner_user_id WHERE t.id = ?").get(dispute.trade_id);
  if (!trade) return res.status(404).json({ error: "TradeNotFound" });

  const messages = db.prepare("SELECT m.*, u.name as sender_name FROM messages m JOIN users u ON u.id = m.sender_user_id WHERE m.trade_id = ? ORDER BY m.created_at ASC").all(dispute.trade_id);

  res.json({ dispute, trade, messages });
});

app.post("/api/admin/message", auth, requireAdmin, (req, res) => {
  const { user_id, content } = req.body;
  const now = new Date().toISOString();
  // This is a simplified implementation. In a real-world application, you'd want to
  // create a new conversation or thread for admin-user communication.
  db.prepare("INSERT INTO messages (trade_id, sender_user_id, recipient_user_id, content, created_at, is_admin_message) VALUES (?, ?, ?, ?, ?, ?)").run(null, req.userId, user_id, content, now, 1);
  res.json({ ok: true });
});

app.get("/api/external/products", auth, async (req, res) => {
  try {
    const r = await fetch("https://dummyjson.com/products?limit=30");
    const j = await r.json();
    res.json(j.products || []);
  } catch {
    res.status(500).json({ error: "ExternalFetchFailed" });
  }
});

app.post("/api/admin/import-external", auth, requireAdmin, async (req, res) => {
  try {
    const { limit = 20 } = req.body || {};
    const r = await fetch(`https://dummyjson.com/products?limit=${limit}`);
    const j = await r.json();
    const products = j.products || [];
    const now = new Date().toISOString();
    const adminId = req.userId;
    const insert = db.prepare("INSERT OR IGNORE INTO items (user_id,original_user_id,name,description,category,condition,price,type,img,external_source,external_id,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)");
    products.forEach(p => {
      const priceKsh = Math.round((p.price || 10) * 150); // approximate conversion
      const condition = (p.rating && p.rating > 4.5) ? "Like New" : "Used";
      const type = "topup";
      insert.run(adminId, adminId, p.title || "Product", p.description || "", p.category || "", condition, priceKsh, type, (p.thumbnail || ""), "dummyjson", String(p.id ?? ""), 'Available', now);
    });
    res.json({ imported: products.length });
  } catch (e) {
    res.status(500).json({ error: "ImportFailed" });
  }
});

const port = 8000;
app.get("/", (req, res) => {
  res.redirect("/dashboard.html");
});

app.listen(port, () => {
  console.log(`Server running at http://127.0.0.1:${port}`);
});