(() => {
  const GRID = 20;
  const START_LEN = 4;
  const BASE_SPEED_MS = 140;
  const SPEEDUP_EVERY = 5;
  const SPEEDUP_DELTA = 6;
  const canvas = document.getElementById("board");
  const ctx = canvas.getContext("2d");
  const scoreVal = document.getElementById("scoreVal");
  const bestVal = document.getElementById("bestVal");
  const startBtn = document.getElementById("startBtn");
  const restartBtn = document.getElementById("restartBtn");
  const dpad = document.querySelector(".dpad");
  const themeBtn = document.getElementById("themeBtn");

  const themes = [
  { snake: "#15ff00", head: "#22ff22", food: "#ff0000", obstacle: "#ffaa00" }, // classic
  { snake: "#00e5ff", head: "#33f0ff", food: "#ff00c8", obstacle: "#ffdd00" }, // neon
  { snake: "#ffffff", head: "#cccccc", food: "#ff5555", obstacle: "#7777ff" }, // mono
];
let themeIndex = 0;

function applyTheme(theme) {
  const root = document.documentElement;
  root.style.setProperty("--snake", theme.snake);
  root.style.setProperty("--head", theme.head);
  root.style.setProperty("--food", theme.food);
  root.style.setProperty("--obstacle", theme.obstacle);
  draw(); // redraw immediately so it doesn't wait for next tick
}

themeBtn.addEventListener("click", () => {
  themeIndex = (themeIndex + 1) % themes.length;
  applyTheme(themes[themeIndex]);
});
  let snake, dir, nextDir, food, obstacles;
  let timer, running, score, tickMs, gameOver, bestScore;
  let newBestFlashUntil = 0;
  const cell = () => Math.floor(canvas.width / GRID);
  function init() {
    const mid = Math.floor(GRID / 2);
    snake = [];
    for (let i = START_LEN - 1; i >= 0; i--)
      snake.push({ x: mid - i, y: mid });
    dir = { x: 1, y: 0 };
    nextDir = { ...dir };
    spawnFood();
    spawnObstacles();
    score = 0;
    tickMs = BASE_SPEED_MS;
    running = false;
    gameOver = false;
    bestScore = parseInt(localStorage.getItem("snakeBest") || "0", 10);
    scoreVal.textContent = score;
    bestVal.textContent = bestScore;
    draw(true);
  }
  function spawnFood() {
    food = randomFreeCell();
    food.isGolden = Math.random() < 0.10;
    food.points = food.isGolden ? 5 : 1;
  }
  function spawnObstacles() {
    obstacles = [];
    for (let i = 0; i < 5; i++) obstacles.push(randomFreeCell());
  }
  function randomFreeCell() {
    const occupied = new Set(snake.map((p) => p.x + "," + p.y));
    if (food) occupied.add(food.x + "," + food.y);
    obstacles?.forEach((o) => occupied.add(o.x + "," + o.y));
    let x, y;
    do {
      x = Math.floor(Math.random() * GRID);
      y = Math.floor(Math.random() * GRID);
    } while (occupied.has(x + "," + y));
    return { x, y };
  }
  function setDirection(nx, ny) {
    if (snake.length > 1 && nx === -dir.x && ny === -dir.y) return;
    nextDir = { x: nx, y: ny };
  }
  function step() {
    if (!running) return;
    dir = nextDir;
    const head = snake[snake.length - 1];
    const newHead = { x: head.x + dir.x, y: head.y + dir.y };
    // walls kill
    if (
      newHead.x < 0 ||
      newHead.x >= GRID ||
      newHead.y < 0 ||
      newHead.y >= GRID
    ) {
      return endGame();
    }
    // self
    if (snake.some((p) => p.x === newHead.x && p.y === newHead.y))
      return endGame();
    // obstacles
    if (obstacles.some((o) => o.x === newHead.x && o.y === newHead.y))
      return endGame();
    snake.push(newHead);
    if (newHead.x === food.x && newHead.y === food.y) {
      score += food.points;
      scoreVal.textContent = score;
      if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("snakeBest", bestScore);
        bestVal.textContent = bestScore;
        newBestFlashUntil = Date.now() + 1000;
      }
      spawnFood();
      tickMs = Math.max(60, tickMs - SPEEDUP_DELTA);
      restartTimer();
    } else {
      snake.shift();
    }
    draw();
  }
  function restartTimer() {
    clearInterval(timer);
    timer = setInterval(step, tickMs);
  }
  function startPause() {
    if (gameOver) return;
    running = !running;
    if (running) {
      restartTimer();
      startBtn.textContent = "Pause";
    } else {
      clearInterval(timer);
      startBtn.textContent = "Start";
    }
  }
  function endGame() {
    running = false;
    gameOver = true;
    clearInterval(timer);
    draw(true);
    startBtn.textContent = "Start / Pause";
  }
  function restart() {
    clearInterval(timer);
    init();
  }
  function draw(showGameOver = false) {
    const rect = canvas.getBoundingClientRect();
    const size = Math.floor(Math.min(rect.width, rect.height));
    if (canvas.width !== size || canvas.height !== size)
      canvas.width = canvas.height = size;
    const c = cell();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // obstacles
    ctx.fillStyle = getCss("--obstacle");
    obstacles.forEach((o) => ctx.fillRect(o.x * c, o.y * c, c, c));
    // food (circle)
    ctx.fillStyle = food.isGolden ? "#ffd700" : getCss("--food");
    ctx.beginPath();
    ctx.arc(
      food.x * c + c / 2,
      food.y * c + c / 2,
      c * 0.35,
      0,
      Math.PI * 2
    );
    ctx.fill();
    // snake body
    ctx.fillStyle = getCss("--snake");
    snake
      .slice(0, -1)
      .forEach((p) => ctx.fillRect(p.x * c, p.y * c, c, c));
    // head (triangle + eyes)
    const head = snake[snake.length - 1];
    ctx.fillStyle = getCss("--head");
    ctx.beginPath();
    const px = head.x * c,
      py = head.y * c;
    if (dir.x === 1) {
      // right
      ctx.moveTo(px, py);
      ctx.lineTo(px, py + c);
      ctx.lineTo(px + c, py + c / 2);
    } else if (dir.x === -1) {
      // left
      ctx.moveTo(px + c, py);
      ctx.lineTo(px + c, py + c);
      ctx.lineTo(px, py + c / 2);
    } else if (dir.y === 1) {
      // down
      ctx.moveTo(px, py);
      ctx.lineTo(px + c, py);
      ctx.lineTo(px + c / 2, py + c);
    } else {
      // up
      ctx.moveTo(px, py + c);
      ctx.lineTo(px + c, py + c);
      ctx.lineTo(px + c / 2, py);
    }
    ctx.closePath();
    ctx.fill();
    // eyes
    ctx.fillStyle = "#fff";
    const eyeSize = c * 0.15;
    if (dir.x === 1 || dir.x === -1) {
      const offset = dir.x === 1 ? 0.7 : 0.3;
      ctx.beginPath();
      ctx.arc(px + c * offset, py + c * 0.3, eyeSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(px + c * offset, py + c * 0.7, eyeSize, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const offset = dir.y === 1 ? 0.7 : 0.3;
      ctx.beginPath();
      ctx.arc(px + c * 0.3, py + c * offset, eyeSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(px + c * 0.7, py + c * offset, eyeSize, 0, Math.PI * 2);
      ctx.fill();
    }
    if (Date.now() < newBestFlashUntil) {
      ctx.fillStyle = "#ffd700";
      ctx.font = `bold ${Math.floor(c * 0.5)}px system-ui, Arial`;
      ctx.textAlign = "center";
      ctx.fillText("New Best!", canvas.width / 2, c * 0.8);
    }
    if (showGameOver && gameOver) {
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${Math.floor(c * 0.9)}px system-ui, Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        "Game Over",
        canvas.width / 2,
        canvas.height / 2 - c * 1.2
      );
      ctx.font = `500 ${Math.floor(c * 0.6)}px system-ui, Arial`;
      ctx.fillText(
        `Score: ${score}`,
        canvas.width / 2,
        canvas.height / 2 - c * 0.2
      );
    }
  }
  function getCss(varName) {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim();
  }
  window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    const map = {
      arrowup: [0, -1],
      w: [0, -1],
      arrowdown: [0, 1],
      s: [0, 1],
      arrowleft: [-1, 0],
      a: [-1, 0],
      arrowright: [1, 0],
      d: [1, 0],
      " ": "toggle",
      enter: "toggle",
    };
    if (map[k]) {
      e.preventDefault();
      if (map[k] === "toggle") startPause();
      else setDirection(...map[k]);
    }
  });
  dpad.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-dir]");
    if (!btn) return;
    const map = {
      up: [0, -1],
      down: [0, 1],
      left: [-1, 0],
      right: [1, 0],
    };
    setDirection(...map[btn.dataset.dir]);
  });
  startBtn.addEventListener("click", startPause);
  restartBtn.addEventListener("click", restart);
  window.addEventListener("resize", () => draw());
  init();
})();
