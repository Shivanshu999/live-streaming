import express from "express";
import path from "path";

const app = express();

// CORS (required for HLS on mobile)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

// HLS static serving (INSIDE CONTAINER PATH)
app.use(
  "/hls",
  express.static(path.resolve("/app/streams/hls"), {
    setHeaders(res, filePath) {
      if (filePath.endsWith(".m3u8")) {
        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
        res.setHeader("Cache-Control", "no-cache");
      }

      if (filePath.endsWith(".ts")) {
        res.setHeader("Content-Type", "video/mp2t");
        res.setHeader("Cache-Control", "no-cache");
      }
    },
  })
);

// Player files
app.use("/public", express.static("public"));

app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on http://0.0.0.0:3000");
});