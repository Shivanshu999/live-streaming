import express from "express";
import path from "path";

const app = express();

// CORS (required for ABR and HLS playback)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Range");
  next();
});

// HLS static serving
// Updated path to /app/streams/hls to match the new volume mount
app.use(
  "/hls",
  express.static("/app/streams/hls", {
    setHeaders(res, filePath) {
      if (filePath.endsWith(".m3u8")) {
        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
        // Strict no-cache is vital for live ABR so the player finds new segments
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      }

      if (filePath.endsWith(".ts")) {
        res.setHeader("Content-Type", "video/mp2t");
        res.setHeader("Cache-Control", "no-cache");
      }
    },
  })
);

// Player files
// Updated to /app/public to match the new volume mount
app.use("/public", express.static("/app/public"));

app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on http://localhost:3000");
  console.log("Access your player at http://localhost:3000/public/player.html");
});