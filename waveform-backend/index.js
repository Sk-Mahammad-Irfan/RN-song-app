const express = require("express");
const cors = require("cors");
const { execFile } = require("child_process");
const path = require("path");
const Database = require("better-sqlite3");

const YTDLP = path.join(__dirname, "yt-dlp.exe");

// ── Database setup ──
const db = new Database(path.join(__dirname, "waveform.db"));

// Create requests table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    song_name TEXT NOT NULL,
    artist TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    count INTEGER DEFAULT 1,
    eta_days INTEGER DEFAULT 2,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

console.log("Database ready at waveform.db");

const app = express();
app.use(cors());
app.use(express.json());

// ── Health check ──
app.get("/", (req, res) => {
  res.json({ status: "Waveform backend running ✓" });
});

// ── Stream URL ──
app.get("/stream-url", async (req, res) => {
  const { title, artist } = req.query;

  if (!title) {
    return res.status(400).json({ error: "title is required" });
  }

  const searchQuery = `ytsearch1:${title} ${artist} official audio`;
  console.log(`\n[yt-dlp] Searching: "${searchQuery}"`);

  const args = [
    searchQuery,
    "--format",
    "bestaudio[ext=m4a]/bestaudio/best",
    "--get-url",
    "--no-playlist",
    "--no-check-certificates",
    "--prefer-free-formats",
    "--js-runtimes",
    "nodejs",
    "--quiet",
  ];

  execFile(YTDLP, args, { timeout: 30000 }, (error, stdout, stderr) => {
    if (error) {
      console.error("[yt-dlp] Error:", stderr || error.message);
      return res.status(500).json({
        error: "Failed to extract stream",
        details: stderr || error.message,
      });
    }

    const streamUrl = stdout.trim();

    if (!streamUrl || !streamUrl.startsWith("http")) {
      return res.status(404).json({ error: "No valid stream URL found" });
    }

    console.log(`[yt-dlp] ✓ Stream found for: "${title}"`);
    res.json({ streamUrl, title, artist });
  });
});

// ─────────────────────────────────────────────
// REQUESTS API
// ─────────────────────────────────────────────

// GET /requests — fetch all requests sorted by count
app.get("/requests", (req, res) => {
  try {
    const requests = db
      .prepare(
        `
      SELECT * FROM requests
      ORDER BY count DESC, created_at DESC
    `,
      )
      .all();
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /requests — add new request or upvote existing
app.post("/requests", (req, res) => {
  const { song_name, artist } = req.body;

  if (!song_name || !artist) {
    return res.status(400).json({ error: "song_name and artist are required" });
  }

  try {
    // Check if request already exists (case insensitive)
    const existing = db
      .prepare(
        `
      SELECT * FROM requests
      WHERE LOWER(song_name) = LOWER(?) AND LOWER(artist) = LOWER(?)
    `,
      )
      .get(song_name, artist);

    if (existing) {
      // Upvote existing request
      db.prepare(
        `
        UPDATE requests
        SET count = count + 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      ).run(existing.id);

      const updated = db
        .prepare("SELECT * FROM requests WHERE id = ?")
        .get(existing.id);
      return res.json({ request: updated, upvoted: true });
    }

    // Create new request
    const result = db
      .prepare(
        `
      INSERT INTO requests (song_name, artist, status, count, eta_days)
      VALUES (?, ?, 'pending', 1, 2)
    `,
      )
      .run(song_name, artist);

    const created = db
      .prepare("SELECT * FROM requests WHERE id = ?")
      .get(result.lastInsertRowid);
    res.json({ request: created, upvoted: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /requests/:id/upvote — upvote a specific request
app.post("/requests/:id/upvote", (req, res) => {
  const { id } = req.params;
  try {
    const existing = db.prepare("SELECT * FROM requests WHERE id = ?").get(id);
    if (!existing) {
      return res.status(404).json({ error: "Request not found" });
    }

    db.prepare(
      `
      UPDATE requests
      SET count = count + 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    ).run(id);

    const updated = db.prepare("SELECT * FROM requests WHERE id = ?").get(id);
    res.json({ request: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /requests/:id/status — mark as ready (admin use)
app.patch("/requests/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["pending", "ready"].includes(status)) {
    return res.status(400).json({ error: "status must be pending or ready" });
  }

  try {
    db.prepare(
      `
      UPDATE requests
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    ).run(status, id);

    const updated = db.prepare("SELECT * FROM requests WHERE id = ?").get(id);
    res.json({ request: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`\nWaveform backend running at http://192.168.0.102:${PORT}\n`);
});
