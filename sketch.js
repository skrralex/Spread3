const cols = 25;
const rows = 15;
let grid = [];
let cellSize;
let running = false;
let infectedCount = 0;
let healthyCount = 0;
let button;

function setup() {
  createCanvas(windowWidth, windowHeight);
  cellSize = min(width / cols, height / rows);
  initGrid();

  button = createButton('Run Simulation');
  button.position(20, 20);
  button.mousePressed(startSimulation);
}

function initGrid() {
  grid = [];
  for (let y = 0; y < rows; y++) {
    let row = [];
    for (let x = 0; x < cols; x++) {
      row.push({ 
        state: 'healthy', // healthy, vaccinated, infected
        nextState: 'healthy' 
      });
    }
    grid.push(row);
  }
}

function startSimulation() {
  // Reset infection
  for (let r of grid) for (let c of r) if (c.state === 'infected') c.state = 'healthy';
  let randomCell = grid[int(random(rows))][int(random(cols))];
  randomCell.state = 'infected';
  running = true;
}

function draw() {
  background(10);

  let infectionSpread = false;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let cell = grid[y][x];

      // Draw cell
      if (cell.state === 'vaccinated') fill(100, 200, 255);
      else if (cell.state === 'infected') fill(255, 80, 80);
      else fill(220);
      stroke(40);
      rect(x * cellSize, y * cellSize, cellSize - 1, cellSize - 1);

      if (running && cell.state === 'infected') {
        // Try infecting neighbors
        for (let ny = -1; ny <= 1; ny++) {
          for (let nx = -1; nx <= 1; nx++) {
            if (abs(nx) + abs(ny) !== 1) continue; // only cardinal directions
            let yy = y + ny;
            let xx = x + nx;
            if (yy >= 0 && yy < rows && xx >= 0 && xx < cols) {
              let neighbor = grid[yy][xx];
              if (neighbor.state === 'healthy') {
                if (random() < 0.25) {
                  neighbor.nextState = 'infected';
                  infectionSpread = true;
                }
              }
            }
          }
        }
      }
    }
  }

  // Update grid
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let c = grid[y][x];
      c.state = c.nextState;
      c.nextState = c.state;
    }
  }

  // Count states
  infectedCount = grid.flat().filter(c => c.state === 'infected').length;
  healthyCount = grid.flat().filter(c => c.state === 'healthy').length;

  // Display stats
  fill(255);
  noStroke();
  textSize(16);
  textAlign(LEFT, TOP);
  text(`Infected: ${infectedCount}`, 20, 60);
  text(`Healthy: ${healthyCount}`, 20, 80);

  // Stop when no new infections
  if (running && !infectionSpread) running = false;
}

function mousePressed() {
  if (mouseY < 100) return; // ignore GUI area
  let x = floor(mouseX / cellSize);
  let y = floor(mouseY / cellSize);
  if (x >= 0 && x < cols && y >= 0 && y < rows) {
    let cell = grid[y][x];
    if (cell.state === 'healthy') cell.state = 'vaccinated';
    else if (cell.state === 'vaccinated') cell.state = 'healthy';
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  cellSize = min(width / cols, height / rows);
}
