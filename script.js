let allData = {};
let currentPlayer = null;

async function loadData() {
  const res = await fetch("data.json");
  allData = await res.json();
  createPlayerList();
}

function createPlayerList(filter = "") {
  const list = document.getElementById("player-list");
  list.innerHTML = "";

  Object.keys(allData).forEach(id => {
    const p = allData[id];
    const text = `${id} ${p.name}`;

    if (!text.includes(filter)) return;

    const btn = document.createElement("button");
    btn.className = "player-btn";
    btn.textContent = text;
    btn.dataset.player = id;

    btn.addEventListener("click", () => {
      document.querySelectorAll(".player-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      currentPlayer = id;
      document.getElementById("player-name").textContent = p.name;

      renderBoat("boat1");
      document.querySelector(".tabs .active").classList.remove("active");
      document.querySelector('[data-boat="boat1"]').classList.add("active");
    });

    list.appendChild(btn);
  });
}

document.getElementById("search").addEventListener("input", e => {
  createPlayerList(e.target.value);
});

function fillMissingRuns(arr, target = 90) {
  const current = arr.length;

  if (current === 0) {
    return Array.from({ length: target }, () => ({ v: 5, gen: true }));
  }

  if (current >= target) {
    return arr.map(v => ({ v, gen: false }));
  }

  const avg = arr.reduce((a, b) => a + b, 0) / current;
  const sd = Math.sqrt(arr.map(v => (v - avg) ** 2).reduce((a, b) => a + b, 0) / current);

  const result = arr.map(v => ({ v, gen: false }));

  for (let i = current; i < target; i++) {
    let val = Math.round(avg + (Math.random() * sd * 2 - sd));
    val = Math.max(1, Math.min(10, val));
    result.push({ v: val, gen: true });
  }

  return result;
}

function getColor(boat, value) {
  const colors = {
    boat1: "rgba(255,0,0,",
    boat2: "rgba(0,0,0,",
    boat3: "rgba(0,0,255,",
    boat4: "rgba(255,255,0,",
    boat5: "rgba(0,255,0,",
    boat6: "rgba(255,255,255,"
  };
  const alpha = value / 10;
  return colors[boat] + alpha + ")";
}

function renderBoat(boat) {
  const container = document.getElementById("heatmap");
  container.innerHTML = "";

  if (!currentPlayer) return;

  const raw = allData[currentPlayer][boat];
  const arr = fillMissingRuns(raw);

  arr.forEach((obj, i) => {
    const div = document.createElement("div");
    div.className = "cell";

    if (obj.gen) div.classList.add("generated");
    if (i >= arr.length - 10) div.classList.add("recent");

    div.style.background = getColor(boat, obj.v);
    container.appendChild(div);
  });
}

loadData().then(() => {
  document.querySelectorAll(".tabs button").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelector(".tabs .active").classList.remove("active");
      btn.classList.add("active");
      renderBoat(btn.dataset.boat);
    });
  });
});
