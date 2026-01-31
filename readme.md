# Netflix-Like Live Streaming Engine 🎥

A scalable microservices architecture for live video streaming using Nginx-RTMP, FFmpeg, and Node.js.

## 🏗 Architecture
* **Ingest:** Nginx RTMP (Receives OBS Stream)
* **Transcoding:** FFmpeg (Generates HLS H.264 ladder: 480p, 240p, 144p)
* **Delivery:** Node.js (Serves HLS segments & Custom Player)

## 🚀 How to Run
1. `docker compose up -d`  or `docker compose up -d`
2. Stream from OBS to `rtmp://localhost/live` (Key: `test`)
3. Watch at `http://localhost:3000/public/player.html`