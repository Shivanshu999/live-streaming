//public/player.js
let hls = null;
let statsInterval = null;

const debugEl = document.getElementById("debug-overlay");

/* ---------------- DEBUG STATS ---------------- */

function updateStats(hls, video) {
  if (!hls || !video) return;

  const buf = video.buffered;
  const lat = hls.latency ?? 0;

  let bufferLen = 0;
  if (buf.length > 0 && !isNaN(video.currentTime)) {
    for (let i = 0; i < buf.length; i++) {
      if (buf.start(i) <= video.currentTime && video.currentTime <= buf.end(i)) {
        bufferLen = buf.end(i) - video.currentTime;
        break;
      }
    }
  }

  debugEl.innerHTML = `
    Latency: ${lat.toFixed(2)}s<br>
    Buffer Ahead: ${bufferLen.toFixed(2)}s<br>
    Drift: ${hls.drift?.toFixed(2) ?? "0.00"}
  `;

  if (bufferLen < 2) debugEl.style.color = "#ef4444";
  else if (bufferLen < 6) debugEl.style.color = "#f59e0b";
  else debugEl.style.color = "#22c55e";
}

/* ---------------- STREAM START ---------------- */

function startStream() {
  const video = document.getElementById("v");
  const btnContainer = document.getElementById("quality-buttons");
  const streamUrl =
  "http://localhost:3000/hls/test/index.m3u8?ts=" + Date.now();

  if (hls) {
    hls.destroy();
    hls = null;
  }

  if (statsInterval) {
    clearInterval(statsInterval);
    statsInterval = null;
  }

  if (!Hls.isSupported()) {
    alert("HLS not supported in this browser");
    return;
  }

  hls = new Hls({
    /* -------- LIVE STABILITY SETTINGS -------- */

    // Stay further behind live edge (prevents missing segments)
    liveSyncDurationCount: 5,
    liveMaxLatencyDurationCount: 10,

    // Bigger buffer = fewer stalls
    maxBufferLength: 60,

    // Start at live edge
    startPosition: -1,

    // Stability
    enableWorker: true,
    lowLatencyMode: false,

    manifestLoadingTimeOut: 15000,
    levelLoadingTimeOut: 15000,
    fragLoadingTimeOut: 20000,
  });

  hls.loadSource(streamUrl);
  hls.attachMedia(video);

  /* ---------------- EVENTS ---------------- */

  hls.on(Hls.Events.MANIFEST_PARSED, () => {
    console.log("✅ Manifest loaded");
    createQualityButtons(hls.levels, btnContainer);

    video.play().catch(err => {
      console.warn("Autoplay blocked:", err);
    });

    statsInterval = setInterval(() => updateStats(hls, video), 500);
  });

  hls.on(Hls.Events.ERROR, (event, data) => {
    // 🚨 EXPECTED in live streaming — DO NOT panic
    if (
      data.type === Hls.ErrorTypes.NETWORK_ERROR &&
      data.details === Hls.ErrorDetails.FRAG_LOAD_ERROR
    ) {
      console.warn("⚠️ Fragment missing (normal for live), recovering…");
      return;
    }

    if (data.fatal) {
      console.error("🔥 Fatal HLS error:", data);

      switch (data.type) {
        case Hls.ErrorTypes.NETWORK_ERROR:
          hls.startLoad();
          break;

        case Hls.ErrorTypes.MEDIA_ERROR:
          hls.recoverMediaError();
          break;

        default:
          hls.destroy();
          break;
      }
    }
  });

  hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
    const level = hls.levels[data.level];
    console.log(`🔁 Switched to ${level.name || level.height + "p"}`);
  });
}

/* ---------------- QUALITY UI ---------------- */

function createQualityButtons(levels, container) {
  container.innerHTML = "";
  container.style.display = "flex";

  const autoBtn = document.createElement("button");
  autoBtn.innerText = "Auto";
  autoBtn.className = "quality-btn active";

  autoBtn.onclick = () => {
    hls.currentLevel = -1;
    updateActiveButton(container, autoBtn);
  };

  container.appendChild(autoBtn);

  levels.forEach((level, index) => {
    const btn = document.createElement("button");
    btn.innerText = level.name || `${level.height}p`;
    btn.className = "quality-btn";

    btn.onclick = () => {
      console.log("Manual quality:", btn.innerText);
      hls.currentLevel = index;
      updateActiveButton(container, btn);
    };

    container.appendChild(btn);
  });
}

function updateActiveButton(container, activeBtn) {
  const buttons = container.getElementsByClassName("quality-btn");
  for (let btn of buttons) btn.classList.remove("active");
  activeBtn.classList.add("active");
}