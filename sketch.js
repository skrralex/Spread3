let hexSize;
let hexCols, hexRows;
let grid = [];
let running = false;
let speedSlider, runButton;
let lastUpdate = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("sans-serif");

  speedSlider = createSlider(1, 60, 10, 1); // steps per second
  speedSlider.position(20, 20);
  speedSlider.style("width", "200px");

  runButton = createButton("Run Simulation");
  runButton.position(240, 20);
  runButton.mousePressed(startSimulation);

  initGrid();
}

function initGrid() {
  grid = [];
  let spacing = 28; // pixel distance between centers
  hexSize = spacing / 1.15;

  hexCols = int(width / spacing);
  hexRows = int(height / (spacing * 0.87));

  for (let y = 0; y < hexRows; y++) {
    let row = [];
    for (let x = 0; x < hexCols; x++) {
      let xOffset = (y % 2) * (spacing / 2);
      row.push({
        x: x * spacing + xOffset + spacing / 2,
        y: y * spacing * 0.87 + spacing,
        state: "healthy",
        next: "healthy"
      });
    }
    grid.push(row);
  }
}

function startSimulation() {
  // clear infections
  for (let row of grid) for (let c of row) if (c.state === "infected") c.state = "healthy";
  let ry = int(random(hexRows));
  let rx = int(random(hexCols));
  grid[ry][rx].state = "infected";
  running = true;
}

function draw() {
  background(15);

  // label
  fill(255);
  noStroke();
  textSize(14);
  text(`Speed: ${speedSlider.value()} steps/sec`, 20, 50);

  let now = millis();
  if (running && now - lastUpdate > 1000 / speedSlider.value()) {
    stepSimulation();
    lastUpdate = now;
  }

  // draw hexes
  for (let y = 0; y < hexRows; y++) {
    for (let x = 0; x < hexCols; x++) {
      drawHex(grid[y][x]);
    }
  }
}

function drawHex(cell) {
  let c;
  if (cell.state === "vaccinated") c = color(100, 200, 255);
  else if (cell.state === "infected") c = color(255, 80, 80);
  else c = color(220);
  stroke(40);
  fill(c);
  hex(cell.x, cell.y, hexSize);
}

function stepSimulation() {
  let infectionSpread = false;
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
  // update
  for (let y = 0; y < hexRows; y++)
    for (let x = 0; x < hexCols; x++) grid[y][x].state = grid[y][x].next;

  if (!infectionSpread) running = false;
}

function getNeighbors(x, y) {
  let dirsEven = [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1]];
  let dirsOdd  = [[-1,0],[1,0],[0,-1],[0,1],[-1,1],[1,1]];
  let dirs = (y % 2 === 0) ? dirsEven : dirsOdd;
  let list = [];
  for (let [dx,dy] of dirs) {
    let nx = x + dx, ny = y + dy;
    if (ny>=0 && ny<hexRows && nx>=0 && nx<hexCols) list.push(grid[ny][nx]);
  }
  return list;
}

function mousePressed() {
  if (mouseY < 70) return;
  let spacing = 28;
  for (let y = 0; y < hexRows; y++) {
    for (let x = 0; x < hexCols; x++) {
      let c = grid[y][x];
      if (dist(mouseX, mouseY, c.x, c.y) < hexSize) {
        c.state = (c.state === "vaccinated") ? "healthy" : "vaccinated";
        return;
      }
    }
  }
}

function hex(x, y, r) {
  beginShape();
  for (let a = 0; a < TWO_PI; a += PI / 3) {
    vertex(x + cos(a) * r, y + sin(a) * r);
  }
  endShape(CLOSE);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initGrid();
}
