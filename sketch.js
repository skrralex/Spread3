let grid = [];
let hexSize;
let spacing;
let hexCols, hexRows;
let running = false;
let runButton, speedSlider;
let lastStep = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("sans-serif");

  // Controls
  runButton = createButton("Run Simulation");
  runButton.position(20, 20);
  runButton.mousePressed(startSimulation);

  speedSlider = createSlider(1, 30, 5, 1); // speed control
  speedSlider.position(160, 20);
  speedSlider.style("width", "150px");

  initGrid();
}

function initGrid() {
  grid = [];

  // Fit hexes based on window size
  let targetCols = floor(width / 30);
  spacing = width / targetCols;
  hexSize = spacing * 0.55;
  hexCols = targetCols;
  hexRows = floor(height / (hexSize * 1.5));

  for (let y = 0; y < hexRows; y++) {
    let row = [];
    for (let x = 0; x < hexCols; x++) {
      let xOffset = (y % 2) * (spacing / 2);
      row.push({
        x: x * spacing + xOffset + spacing / 2,
        y: y * hexSize * 1.8 + hexSize,
        state: "healthy",
        next: "healthy"
      });
    }
    grid.push(row);
  }
}

function startSimulation() {
  // clear old infections
  for (let row of grid) for (let c of row) if (c.state === "infected") c.state = "healthy";
  let ry = int(random(hexRows));
  let rx = int(random(hexCols));
  grid[ry][rx].state = "infected";
  running = true;
}

function draw() {
  background(15);

  fill(255);
  noStroke();
  textSize(14);
  text(`Speed: ${speedSlider.value()} steps/sec`, 330, 33);

  // Step timing
  if (running && millis() - lastStep > 1000 / speedSlider.value()) {
    simulateStep();
    lastStep = millis();
  }

  // Draw hexes
  for (let y = 0; y < hexRows; y++) {
    for (let x = 0; x < hexCols; x++) {
      drawHex(grid[y][x]);
    }
  }
}

function simulateStep() {
  let infectionSpread = false;

  // Compute next state
  for (let y = 0; y < hexRows; y++) {
    for (let x = 0; x < hexCols; x++) {
      let cell = grid[y][x];
      cell.next = cell.state;

      if (cell.state === "infected") {
        for (let n of getNeighbors(x, y)) {
          if (n.state === "healthy" && random() < 0.25) {
            n.next = "infected";
            infectionSpread = true;
          }
        }
      }
    }
  }

  // Apply updates
  for (let y = 0; y < hexRows; y++) {
    for (let x = 0; x < hexCols; x++) {
      grid[y][x].state = grid[y][x].next;
    }
  }

  if (!infectionSpread) running = false;
}

function getNeighbors(x, y) {
  // Hex grid neighbor directions
  const evenDirs = [[1,0],[-1,0],[0,-1],[0,1],[-1,-1],[1,-1]];
  const oddDirs  = [[1,0],[-1,0],[0,-1],[0,1],[-1,1],[1,1]];
  const dirs = (y % 2 === 0) ? evenDirs : oddDirs;
  const list = [];

  for (let [dx, dy] of dirs) {
    let nx = x + dx;
    let ny = y + dy;
    if (ny >= 0 && ny < hexRows && nx >= 0 && nx < hexCols) {
      list.push(grid[ny][nx]);
    }
  }
  return list;
}

function drawHex(cell) {
  let c;
  if (cell.state === "vaccinated") c = color(100, 200, 255);
  else if (cell.state === "infected") c = color(255, 80, 80);
  else c = color(230);

  stroke(40);
  fill(c);
  hex(cell.x, cell.y, hexSize);
}

function hex(x, y, r) {
  beginShape();
  for (let a = 0; a < TWO_PI; a += PI / 3) {
    vertex(x + cos(a) * r, y + sin(a) * r);
  }
  endShape(CLOSE);
}

function mousePressed() {
  if (mouseY < 60) return; // ignore top UI
  for (let y = 0; y < hexRows; y++) {
    for (let x = 0; x < hexCols; x++) {
      let c = grid[y][x];
      if (dist(mouseX, mouseY, c.x, c.y) < hexSize * 0.9) {
        c.state = (c.state === "vaccinated") ? "healthy" : "vaccinated";
        return;
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initGrid();
}
