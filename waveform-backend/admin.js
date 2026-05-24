const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "waveform.db"));

const command = process.argv[2];
const arg = process.argv[3];

// Show all requests
if (command === "list") {
  const requests = db
    .prepare("SELECT * FROM requests ORDER BY count DESC")
    .all();
  if (requests.length === 0) {
    console.log("\nNo requests yet.\n");
    process.exit(0);
  }
  console.log("\n── PENDING ──────────────────────────────");
  requests
    .filter((r) => r.status === "pending")
    .forEach((r) => {
      console.log(
        `  [${r.id}] ${r.song_name} — ${r.artist} (${r.count} requests)`,
      );
    });
  console.log("\n── READY ────────────────────────────────");
  requests
    .filter((r) => r.status === "ready")
    .forEach((r) => {
      console.log(`  [${r.id}] ${r.song_name} — ${r.artist}`);
    });
  console.log("");
}

// Mark a song as ready
else if (command === "ready") {
  if (!arg) {
    console.log("Usage: node admin.js ready <id>");
    process.exit(1);
  }
  const req = db.prepare("SELECT * FROM requests WHERE id = ?").get(arg);
  if (!req) {
    console.log(`No request with id ${arg}`);
    process.exit(1);
  }
  db.prepare(
    "UPDATE requests SET status = 'ready', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
  ).run(arg);
  console.log(`\n✓ "${req.song_name}" by ${req.artist} is now READY\n`);
}

// Mark back to pending
else if (command === "pending") {
  if (!arg) {
    console.log("Usage: node admin.js pending <id>");
    process.exit(1);
  }
  const req = db.prepare("SELECT * FROM requests WHERE id = ?").get(arg);
  if (!req) {
    console.log(`No request with id ${arg}`);
    process.exit(1);
  }
  db.prepare(
    "UPDATE requests SET status = 'pending', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
  ).run(arg);
  console.log(`\n↺ "${req.song_name}" by ${req.artist} set back to PENDING\n`);
}

// Delete a request
else if (command === "delete") {
  if (!arg) {
    console.log("Usage: node admin.js delete <id>");
    process.exit(1);
  }
  const req = db.prepare("SELECT * FROM requests WHERE id = ?").get(arg);
  if (!req) {
    console.log(`No request with id ${arg}`);
    process.exit(1);
  }
  db.prepare("DELETE FROM requests WHERE id = ?").run(arg);
  console.log(`\n✗ Deleted "${req.song_name}" by ${req.artist}\n`);
} else {
  console.log(`
Usage:
  node admin.js list              — show all requests
  node admin.js ready <id>        — mark song as ready
  node admin.js pending <id>      — revert to pending
  node admin.js delete <id>       — delete a request
  `);
}
