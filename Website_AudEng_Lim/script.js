const projects = [
  {
    title: "Kathang Isip / Araw-Araw / Leaves",
    type: "Medley",
    description:
      "A medley project combining three Ben&Ben songs into one continuous arrangement with emotional flow and smooth transitions.",
    image: "images/cover1.png",
    audio: "audio/kathang-isip-medley.mp3",
    tags: ["Medley", "OPM", "Arrangement", "Ben&Ben"]
  },
  {
    title: "Circus - Remix",
    type: "Remix",
    description:
      "A remix of Circus by Britney Spears, focusing on rearranged structure, energy control, and creative audio editing.",
    image: "images/cover2.png",
    audio: "audio/circus-remix.mp3",
    tags: ["Remix", "Pop", "Audio Edit", "Britney Spears"]
  },
  {
    title: "Get Down Saturday Night",
    type: "Cut-Up",
    description:
      "A cut-up edit using rearranged sections, rhythmic chopping, and experimental sequencing.",
    image: "images/cover3.png",
    audio: "audio/get-down-saturday-night-cut-up.mp3",
    tags: ["Cut-Up", "Disco", "Rhythm", "Edit"]
  },
  {
    title: "TV Off / Not Like Us",
    type: "Beat Match",
    description:
      "A beat-matched project combining TV Off and Not Like Us with emphasis on timing, rhythm, and transition flow.",
    image: "images/cover4.png",
    audio: "audio/tv-off-not-like-us-beatmatch.mp3",
    tags: ["Beat Match", "Hip-Hop", "Transition", "Mashup"]
  },
  {
    title: "The Nights / A Sky Full of Stars",
    type: "Mashup",
    description:
      "A mashup project combining The Nights by Avicii and A Sky Full of Stars by Coldplay, focusing on emotional buildup, energetic transitions, and melodic blending.",
    image: "images/cover5.png",
    audio: "audio/the-nights-sky-full-of-stars-mashup.mp3",
    tags: ["Mashup", "EDM", "Pop Rock", "Transition", "Avicii", "Coldplay"]
  },
  {
    title: "Ere",
    type: "Audio Mix",
    description:
      "An audio mix project featuring seamless blending of different tracks and sound elements.",
    image: "images/cover6.png",
    audio: "audio/ere-audio-mix.mp3",
    tags: ["Audio Mix", "Blending", "Sound Design"]
  },
  {
    title: "Sound of my Soul",
    type: "Masterpiece",
    description:
      "My final project inspired from retro synths. Using my own vocals with a vocoder effect matching synths.",
    image: "images/cover7.png",
    audio: "audio/game-life.mp3",
    tags: ["Sound Design"]
  }
];

// Header menu
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

if (menuBtn && navLinks) {
  menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });
}

// Main elements
const projectGrid = document.getElementById("projectGrid");
const modal = document.getElementById("musicModal");
const closeModalBtn = document.getElementById("closeModal");

const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalType = document.getElementById("modalType");
const modalDescription = document.getElementById("modalDescription");
const modalTags = document.getElementById("modalTags");

const audioPlayer = document.getElementById("audioPlayer");
const playPauseBtn = document.getElementById("playPauseBtn");
const progressBar = document.getElementById("progressBar");
const currentTimeText = document.getElementById("currentTime");
const durationText = document.getElementById("duration");

const canvas = document.getElementById("visualizerCanvas");
const canvasContext = canvas.getContext("2d");

// Web Audio API variables
let audioContext;
let analyser;
let source;
let dataArray;
let bufferLength;
let animationId = null;
let audioConnected = false;
let isVisualizerRunning = false;

// Generate project cards
projects.forEach((project, index) => {
  const card = document.createElement("div");
  card.classList.add("project-card");

  card.innerHTML = `
    <img src="${project.image}" alt="${project.title}">
    <div class="project-card-content">
      <h3>${project.title}</h3>
      <p>${project.description}</p>
      <span class="card-type">${project.type}</span>
      <p class="listen-label">Click to listen</p>
    </div>
  `;

  card.addEventListener("click", () => {
    openMusicModal(index);
  });

  projectGrid.appendChild(card);
});

function openMusicModal(index) {
  const project = projects[index];

  stopVisualizer();

  modalImage.src = project.image;
  modalImage.alt = project.title;

  modalTitle.textContent = project.title;
  modalType.textContent = project.type;
  modalDescription.textContent = project.description;

  modalTags.innerHTML = "";

  project.tags.forEach(tagText => {
    const tag = document.createElement("span");
    tag.classList.add("tag");
    tag.textContent = tagText;
    modalTags.appendChild(tag);
  });

  audioPlayer.pause();
  audioPlayer.src = project.audio;
  audioPlayer.load();

  progressBar.value = 0;
  currentTimeText.textContent = "0:00";
  durationText.textContent = "0:00";
  playPauseBtn.textContent = "▶";

  modal.classList.add("active");

  clearCanvas();
}

function closeMusicModal() {
  modal.classList.remove("active");

  audioPlayer.pause();
  audioPlayer.currentTime = 0;
  playPauseBtn.textContent = "▶";

  stopVisualizer();
  clearCanvas();
}

// Close modal using X button
closeModalBtn.addEventListener("click", closeMusicModal);

// Close modal when clicking outside the modal box
modal.addEventListener("click", event => {
  if (event.target === modal) {
    closeMusicModal();
  }
});

// Close modal with Escape key
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && modal.classList.contains("active")) {
    closeMusicModal();
  }
});

// Play / pause button
playPauseBtn.addEventListener("click", async () => {
  setupAudioVisualizer();

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  if (audioPlayer.paused) {
    try {
      await audioPlayer.play();
      playPauseBtn.textContent = "❚❚";
      startVisualizer();
    } catch (error) {
      alert("Audio could not play. Please check the audio file path.");
      console.error(error);
    }
  } else {
    audioPlayer.pause();
    playPauseBtn.textContent = "▶";
    stopVisualizer();
    drawIdleVisualizer();
  }
});

// Update progress bar while music plays
audioPlayer.addEventListener("timeupdate", () => {
  if (!audioPlayer.duration) return;

  const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  progressBar.value = progressPercent;

  currentTimeText.textContent = formatTime(audioPlayer.currentTime);
  durationText.textContent = formatTime(audioPlayer.duration);
});

// Seek music when progress bar changes
progressBar.addEventListener("input", () => {
  if (!audioPlayer.duration) return;

  const seekTime = (progressBar.value / 100) * audioPlayer.duration;
  audioPlayer.currentTime = seekTime;
});

// Reset player when song ends
audioPlayer.addEventListener("ended", () => {
  playPauseBtn.textContent = "▶";
  progressBar.value = 0;

  stopVisualizer();

  // Clear visualizer when the song ends
  clearCanvas();
});

// Setup visualizer
function setupAudioVisualizer() {
  if (!audioContext) {
    audioContext = new AudioContext();
  }

  if (!audioConnected) {
    analyser = audioContext.createAnalyser();
    source = audioContext.createMediaElementSource(audioPlayer);

    source.connect(analyser);
    analyser.connect(audioContext.destination);

    // Higher fftSize gives a smoother waveform
    analyser.fftSize = 2048;

    bufferLength = analyser.fftSize;
    dataArray = new Uint8Array(bufferLength);

    audioConnected = true;
  }
}

function startVisualizer() {
  if (isVisualizerRunning) return;

  isVisualizerRunning = true;
  drawVisualizer();
}

function stopVisualizer() {
  isVisualizerRunning = false;

  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}

// Draw active visualizer
function drawVisualizer() {
    if (!isVisualizerRunning) return;

    animationId = requestAnimationFrame(drawVisualizer);

    if (!analyser) return;

    // Use waveform data instead of frequency/equalizer data
    analyser.getByteTimeDomainData(dataArray);

    resizeCanvas();
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    const centerY = canvas.height / 2;
    const barCount = 150;
    const spacing = canvas.width / barCount;

    canvasContext.strokeStyle = "#f7f7f7";
    canvasContext.lineWidth = 2;
    canvasContext.lineCap = "round";

    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.floor((i / barCount) * bufferLength);
      const value = dataArray[dataIndex];

      // Convert audio value into height
      const normalized = Math.abs(value - 128) / 128;
      let barHeight = normalized * canvas.height * 0.75;

      // Minimum height so it still looks alive
      barHeight = Math.max(barHeight, 3);

      const x = i * spacing;

      canvasContext.beginPath();
      canvasContext.moveTo(x, centerY - barHeight / 2);
      canvasContext.lineTo(x, centerY + barHeight / 2);
      canvasContext.stroke();
    }
}

function clearCanvas() {
  resizeCanvas();
  canvasContext.clearRect(0, 0, canvas.width, canvas.height);
}

function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

// Convert seconds to 0:00 format
function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
}

const videos = document.querySelectorAll("video");

videos.forEach(video => {
  video.addEventListener("play", () => {
    videos.forEach(otherVideo => {
      if (otherVideo !== video) {
        otherVideo.pause();
      }
    });
  });
});