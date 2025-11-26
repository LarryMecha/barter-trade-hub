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
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");

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
    trade_id INTEGER NOT NULL,
    sender_user_id INTEGER NOT NULL,
    recipient_user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(trade_id) REFERENCES trades(id),
    FOREIGN KEY(sender_user_id) REFERENCES users(id),
    FOREIGN KEY(recipient_user_id) REFERENCES users(id)
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
  const u = db.prepare("SELECT is_admin FROM users WHERE id=?").get(req.userId);
  if (!u || !u.is_admin) return res.status(403).json({ error: "Forbidden" });
  next();
}

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
app.listen(port, () => {});