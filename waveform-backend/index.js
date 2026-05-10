const express = require("express");
const cors = require("cors");
const { execFile } = require("child_process");
const path = require("path");

const YTDLP = path.join(__dirname, "yt-dlp.exe");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "Waveform backend running ✓" });
});

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`\nWaveform backend running at http://10.197.93.20:${PORT}\n`);
});
