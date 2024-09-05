const slider = document.getElementById("Range");
const minesweeper = document.getElementById("minesweeper");
const flagCounter = document.getElementById("flagCounter");
const gameover = document.getElementById("gameover");
let gridSize;
let bombSet;
let flagCount;
let gameActive = true;

function addFlag(event) {
  event.preventDefault();
  if (!gameActive) return;

  const cell = event.target;
  if (cell.classList.contains("revealed")) return;
  if (cell.classList.contains("cell")) {
    if (cell.classList.contains("flag")) {
      cell.classList.remove("flag");
      cell.textContent = "";
      flagCount++;
    } else if (flagCount > 0) {
      cell.classList.add("flag");
      cell.textContent = "🚩";
      flagCount--;
    }
    updateFlagCounter();
  }
}

function updateFlagCounter() {
  flagCounter.textContent = `Flags Remaining: ${flagCount}`;
}

function revealCell(cell) {
  if (cell.classList.contains("revealed")) return;
  cell.classList.add("revealed");
  const index = Array.from(minesweeper.children).indexOf(cell);
  const [i, j] = [Math.floor(index / gridSize), index % gridSize];
  const adjacentBombs = countAdjacentBombs(i, j);

  if (adjacentBombs > 0) {
    cell.textContent = adjacentBombs;
    cell.style.backgroundColor = "#8DECB4";
  } else {
    cell.style.backgroundColor = "#8DECB4";
    for (let r = i - 1; r <= i + 1; r++) {
      for (let c = j - 1; c <= j + 1; c++) {
        if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
          const adjIndex = r * gridSize + c;
          const adjCell = minesweeper.children[adjIndex];
          if (adjCell && !adjCell.classList.contains("revealed")) {
            revealCell(adjCell);
          }
        }
      }
    }
  }

  checkWin();
}

function revealBomb() {
  bombSet.forEach((index) => {
    const bombCell = minesweeper.children[index];
    bombCell.classList.add("bomb");
    bombCell.style.backgroundImage = "url('mine.png')";
    bombCell.style.backgroundColor = "#f05a7e";
  });
}

function countAdjacentBombs(i, j) {
  let count = 0;
  for (let r = i - 1; r <= i + 1; r++) {
    for (let c = j - 1; c <= j + 1; c++) {
      if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
        const adjIndex = r * gridSize + c;
        if (bombSet.has(adjIndex)) count++;
      }
    }
  }
  return count;
}

function checkWin() {
  const revealedCells = Array.from(minesweeper.children).filter((cell) =>
    cell.classList.contains("revealed")
  );
  const totalCells = gridSize * gridSize;
  const bombCount = bombSet.size;
  const nonBombCells = totalCells - bombCount;

  if (revealedCells.length === nonBombCells) {
    gameover.textContent = "You won!";
    gameover.classList.add("show");
    gameActive = false;
  }
}

function checker(event) {
  if (!gameActive) return;

  const cell = event.target;

  if (cell.classList.contains("bomb")) {
    revealBomb();
    gameover.textContent = "Game Over!";
    gameover.classList.add("show");
    gameActive = false;
  } else {
    revealCell(cell);
  }
}

function createGrid(size) {
  gridSize = size;
  minesweeper.innerHTML = "";
  gameover.classList.remove("show");

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const maxCellSize = Math.min(viewportWidth, viewportHeight) / (size*1.3) ;
  const cellSize = Math.min(maxCellSize, 60);
  minesweeper.style.gridTemplateColumns = `repeat(${size}, ${cellSize}px)`;
  minesweeper.style.gridTemplateRows = `repeat(${size}, ${cellSize}px)`;

  const totalCells = size * size;
  const bombCount = Math.floor(totalCells * 0.15);
  flagCount = bombCount;
  bombSet = new Set();
  while (bombSet.size < bombCount) {
    bombSet.add(Math.floor(Math.random() * totalCells));
  }
  updateFlagCounter();

  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement("div");
    cell.addEventListener("click", checker);
    cell.addEventListener("contextmenu", addFlag);
    cell.classList.add("cell");
    if (bombSet.has(i)) {
      cell.classList.add("bomb");
    }
    minesweeper.appendChild(cell);
  }
}

createGrid(slider.value);

slider.addEventListener("input", () => {
  createGrid(slider.value);
});
