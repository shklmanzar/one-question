const pages = document.querySelectorAll(".card");
const noBtn = document.getElementById("noBtn");
const yesBtn = document.getElementById("yesBtn");
const lockBtn = document.getElementById("lockBtn");
const dateInput = document.getElementById("date");
const timeInput = document.getElementById("time");
const errorText = document.getElementById("error");

let noMoves = 0;
let chosenDateText = "";
let chosenTimeText = "";

const blockedDates = new Set([
  "2026-07-03",
  "2026-07-04",
  "2026-07-09",
  "2026-07-10",
  "2026-07-11",
  "2026-07-12",
  "2026-07-15",
  "2026-07-16"
]);

const blockedDateText = "3, 4, 9, 10, 11, 12, 15 and 16 July are unavailable.";

function vibrate(pattern = 25) {
  if ("vibrate" in navigator) navigator.vibrate(pattern);
}

function goTo(id) {
  pages.forEach(page => {
    page.classList.remove("active");
    page.classList.remove("celebrate");
  });

  document.getElementById(id).classList.add("active");
}

function celebrateCurrentCard() {
  const activeCard = document.querySelector(".card.active");

  if (activeCard) {
    activeCard.classList.remove("celebrate");
    void activeCard.offsetWidth;
    activeCard.classList.add("celebrate");
  }
}

function moveNoButton() {
  noMoves++;

  const x = Math.random() * 200 - 100;
  const y = Math.random() * 130 - 65;
  const rotate = Math.random() * 24 - 12;

  noBtn.style.transform = `translate(${x}px, ${y}px) rotate(${rotate}deg)`;

  const scale = Math.min(1 + noMoves * 0.18, 2.25);
  yesBtn.style.transform = `scale(${scale})`;

  if (noMoves >= 5) noBtn.textContent = "still no? 😭";
}

function todayISO() {
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  return today.toISOString().slice(0, 10);
}

function isBlockedDate(value) {
  return blockedDates.has(value);
}

function clearError() {
  errorText.textContent = "";
}

function showDateError(message) {
  errorText.textContent = message;
  vibrate([18, 30, 18]);
}

dateInput.min = todayISO();

dateInput.addEventListener("change", () => {
  if (isBlockedDate(dateInput.value)) {
    showDateError(`That day is blocked off 😭 ${blockedDateText}`);
    dateInput.value = "";
  } else {
    clearError();
  }
});

timeInput.addEventListener("change", clearError);

noBtn.addEventListener("mouseenter", moveNoButton);

noBtn.addEventListener("touchstart", event => {
  event.preventDefault();
  moveNoButton();
});

noBtn.addEventListener("click", () => goTo("page-no"));

yesBtn.addEventListener("click", () => {
  vibrate([20, 35, 20]);
  document.body.classList.add("warm");
  yesBtn.classList.add("pulse");
  celebrateCurrentCard();
  burstPetals();

  setTimeout(() => {
    yesBtn.classList.remove("pulse");
    goTo("page-mission");
  }, 850);
});

function lockDate() {
  const selectedDate = dateInput.value;
  const selectedTime = timeInput.value;

  if (!selectedDate || !selectedTime) {
    showDateError("Pick both a date and time first 🙂");
    return;
  }

  if (isBlockedDate(selectedDate)) {
    showDateError(`That day is blocked off 😭 ${blockedDateText}`);
    dateInput.value = "";
    return;
  }

  const chosenDateTime = new Date(`${selectedDate}T${selectedTime}`);

  if (chosenDateTime < new Date()) {
    showDateError("Pick a future date and time 🙂");
    return;
  }

  chosenDateText = chosenDateTime.toLocaleDateString("en-SG", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });

  chosenTimeText = chosenDateTime.toLocaleTimeString("en-SG", {
    hour: "numeric",
    minute: "2-digit"
  });

  vibrate([25, 45, 25]);
  burstPetals();

  lockBtn.textContent = "Date secured.";
  lockBtn.disabled = true;
  lockBtn.style.opacity = "0.85";

  setTimeout(() => {
    goTo("page-loading");
    runLoading();
  }, 900);
}

const loadingSteps = [
  { text: "Dispatch received...", sub: "Preparing operation.", progress: 18 },
  { text: "10-2", sub: "Proceeding to planning...", progress: 36 },
  { text: "Searching for good food...", sub: "Very important tasking.", progress: 54 },
  { text: "Checking Singapore traffic...", sub: "Standby...", progress: 72 },
  { text: "ETA: Hopefully on time 😂", sub: "Road conditions unpredictable.", progress: 88 },
  { text: "Just key in logsheet.", sub: "Date prep completed.", progress: 100 }
];

function runLoading() {
  const loadingText = document.getElementById("loadingText");
  const loadingSub = document.getElementById("loadingSub");
  const loadingFill = document.getElementById("loadingFill");

  let i = 0;

  function nextStep() {
    const step = loadingSteps[i];

    loadingText.textContent = step.text;
    loadingSub.textContent = step.sub;
    loadingFill.style.width = `${step.progress}%`;

    i++;

    if (i < loadingSteps.length) {
      setTimeout(nextStep, 820);
    } else {
      setTimeout(showFinal, 950);
    }
  }

  loadingFill.style.width = "0%";
  nextStep();
}

function showFinal() {
  document.getElementById("finalText").innerHTML =
    `Be ready on <strong>${chosenDateText}</strong> at <strong>${chosenTimeText}</strong>.<br><br><strong>I'll come pick you up.</strong>`;

  playDing();
  burstPetals();
  goTo("page-final");
}

function playDing() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1320, audioContext.currentTime + 0.12);

    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, audioContext.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.35);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.36);
  } catch (error) {}
}

function burstPetals() {
  const canvas = document.getElementById("confetti");
  const context = canvas.getContext("2d");
  const petals = [];

  canvas.width = innerWidth;
  canvas.height = innerHeight;

  for (let i = 0; i < 70; i++) {
    petals.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 5,
      vy: Math.random() * -4 - 1,
      size: Math.random() * 9 + 7,
      life: 120,
      rotate: Math.random() * 360,
      spin: Math.random() * 4 - 2,
      opacity: Math.random() * 0.35 + 0.55
    });
  }

  function drawPetal(petal) {
    context.save();
    context.translate(petal.x, petal.y);
    context.rotate((petal.rotate * Math.PI) / 180);
    context.globalAlpha = petal.opacity;

    context.fillStyle = "#ffd1dc";
    context.beginPath();
    context.ellipse(0, 0, petal.size * 0.55, petal.size, 0, 0, Math.PI * 2);
    context.fill();

    context.restore();
  }

  function animate() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    petals.forEach(petal => {
      petal.x += petal.vx;
      petal.y += petal.vy;
      petal.vy += 0.055;
      petal.vx += Math.sin(petal.life * 0.05) * 0.025;
      petal.rotate += petal.spin;
      petal.life--;
      petal.opacity *= 0.992;

      drawPetal(petal);
    });

    if (petals.some(petal => petal.life > 0)) {
      requestAnimationFrame(animate);
    } else {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  animate();
}
