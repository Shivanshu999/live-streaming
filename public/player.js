let hls = null;
const debugEl = document.getElementById("debug-overlay");

// Update the Debug Overlay with real-time stats
function updateStats(hls, video) {
  if (!hls || !video) return;
  const buf = video.buffered;
  const lat = hls.latency;
  
  // Calculate forward buffer length
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
    Drift: ${hls.drift.toFixed(2)}
  `;
  
  // Color code status for quick diagnosis
  if (bufferLen < 2) debugEl.style.color = "#ef4444"; // Red (Danger)
  else if (bufferLen < 6) debugEl.style.color = "#f59e0b"; // Yellow (Warning)
  else debugEl.style.color = "#22c55e"; // Green (Stable)
}

function startStream() {
  const video = document.getElementById("v");
  const btnContainer = document.getElementById("quality-buttons");
  const streamUrl = "http://localhost:3000/hls/master.m3u8";

  if (hls) hls.destroy();

  if (Hls.isSupported()) {
    hls = new Hls({
      // === STABILITY SETTINGS FOR MACBOOK AIR ===
      liveSyncDurationCount: 3,     
      maxBufferLength: 30,          
      enableWorker: true,
      lowLatencyMode: false,        
      manifestLoadingTimeOut: 10000,
      levelLoadingTimeOut: 10000,
      fragLoadingTimeOut: 20000,    
    });

    hls.loadSource(streamUrl);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
      console.log("Manifest loaded, starting playback...");
      createQualityButtons(hls.levels, btnContainer);
      video.play();
      setInterval(() => updateStats(hls, video), 500);
    });

    hls.on(Hls.Events.ERROR, function (event, data) {
      console.warn("HLS Error:", data.type, data.details);
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.log("Network error, trying to recover...");
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.log("Media error, recovering...");
            hls.recoverMediaError();
            break;
          default:
            hls.destroy();
            break;
        }
      }
    });
    
    hls.on(Hls.Events.LEVEL_SWITCHED, function (event, data) {
       const level = hls.levels[data.level];
       console.log(`Switched to: ${level.name || level.height + 'p'}`);
    });
  }
}

function createQualityButtons(levels, container) {
  container.innerHTML = ''; 
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
      console.log(`Manual switch to: ${btn.innerText}`);
      hls.currentLevel = index; 
      updateActiveButton(container, btn);
    };
    container.appendChild(btn);
  });
}

function updateActiveButton(container, activeBtn) {
  const buttons = container.getElementsByClassName("quality-btn");
  for (let btn of buttons) {
    btn.classList.remove("active");
  }
  activeBtn.classList.add("active");
}