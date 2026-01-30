# Live Streaming Learning Roadmap

## STEP 1: Understand the Minimum Live Streaming Version (DO THIS FIRST)

Forget queues, workers, CDNs for now.

**Your first goal:**
> "Can I stream live video from my laptop camera and watch it in a browser?"

### Tech to Learn (Minimal)
- RTMP (input)
- FFmpeg
- HLS

### What You Build
```
OBS / Browser → RTMP Server → FFmpeg → HLS files → HTML <video>
```

### Tools
- OBS (to send live stream)
- Node.js
- FFmpeg
- Nginx + RTMP module (or MediaMTX)

### 📌 Output
- `.m3u8`
- `.ts` segments

> 👉 This step alone teaches 50% of live streaming fundamentals.

---

## STEP 2: Build a Simple Live Ingest Server (Node + RTMP)

### Option A (fastest)
- Nginx + RTMP module

### Option B (more control)
- MediaMTX (rtsp-simple-server)

You already know Node.js, so I'd suggest:

**Architecture:** `OBS → RTMP Server → FFmpeg`

### Learn
- RTMP handshake
- Stream keys
- Live vs VOD

---

## STEP 3: Encode + Segment (FFmpeg is King 👑)

This maps directly to your Video Encoder / Transformation Service box.

### FFmpeg Does
- Transcoding
- Resolution variants (360p, 480p, 720p)
- HLS segmenting

### Example Mental Model
```
input stream → multiple renditions → HLS playlists
```

---

## STEP 4: Play Live Stream in Browser (HLS)

Browsers don't play RTMP.

### You Need
- HLS.js (for Chrome, Firefox)
- `<video>` tag (Safari supports HLS natively)

**At this stage:** ✅ You have real live video streaming

---

## STEP 5: Add Scale (This Matches Your Diagram)

Now we level up.

### 5.1 Message Queue (Optional but Powerful)

This is where your RabbitMQ / SQS knowledge fits perfectly 🧠

**Use queue for:**
- Stream start events
- Encoding jobs
- Stream end cleanup
- Metrics

**Example:**
```
Stream Started → Queue → Workers spin FFmpeg jobs
```

### 5.2 Worker Model (Your Diagram's "Worker 1 … Worker N")

You already did this for video transcoding 💯

**Reuse that idea:**
- Each worker handles:
  - One live stream
  - Or one bitrate variant

### 5.3 Origin Server

This is where `.m3u8` lives.

**Can be:**
- Nginx
- S3 (yes, S3 works for live HLS with low latency tradeoffs)

### 5.4 CDN (India / USA / Europe)

**Later stage:**
- Cloudflare
- AWS CloudFront

**For now:**
> 👉 Skip CDN, test locally.

---

## ⚡ STEP 6: Low-Latency Live Streaming (Advanced)

Only do this after basic HLS works.

### Options
- LL-HLS
- WebRTC (real-time, expensive)
- SRT

**Hotstar/ESPN usually:**
- WebRTC (studio → server)
- LL-HLS (server → viewers)

---

## 🧱 STEP 7: Production-Grade Add-ons

Once core works:
- Stream auth (JWT)
- DRM (Widevine / FairPlay)
- Viewer count
- Live chat (WebSockets)
- Recording live → VOD
- Auto-scaling workers

---

## 🛣️ Recommended Learning Order (VERY IMPORTANT)

**Follow this order strictly 👇**

1. RTMP + FFmpeg + HLS (local)
2. Browser playback
3. Multiple bitrates
4. Queue + workers
5. Deploy encoder
6. CDN
7. Low latency

---

## 🧠 Since You Already Know

- Node.js
- Queues (RabbitMQ / SQS)
- FFmpeg
- AWS basics

> 👉 You're way ahead of most people attempting live streaming.

---

## 🎯 What I Suggest You Do Right Now

Tell me which one you want to start today:

1. "Set up RTMP + FFmpeg locally"
2. "Node.js live streaming server code"
3. "OBS → Browser live demo"
4. "Queue + worker design for live streams"