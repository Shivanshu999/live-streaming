import express from "express";

const app = express();

/* -------------------- CORS -------------------- */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Range");
  next();
});

/* -------------------- HLS STATIC -------------------- */
app.use(
  "/hls",
  express.static("/app/streams", {
    setHeaders(res, filePath) {
      if (filePath.endsWith(".m3u8")) {
        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      }

      if (filePath.endsWith(".ts")) {
        res.setHeader("Content-Type", "video/mp2t");
        res.setHeader("Cache-Control", "no-cache");
      }
    },
  })
);

/* -------------------- PLAYER -------------------- */
app.use("/public", express.static("/app/public"));

app.listen(3000, "0.0.0.0", () => {
  console.log("✅ Server running on http://localhost:3000");
  console.log("▶ Player: http://localhost:3000/public/player.html");
});