const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const tileSize = 30;
const rows = 20;
const cols = 10;

// Board
let board = Array.from({ length: rows }, () => Array(cols).fill(0));

// Tetromino shapes
const SHAPES = {
    I: [[1,1,1,1]],
    O: [[1,1],[1,1]],
    T: [[0,1,0],[1,1,1]],
    S: [[0,1,1],[1,1,0]],
    Z: [[1,1,0],[0,1,1]],
    J: [[1,0,0],[1,1,1]],
    L: [[0,0,1],[1,1,1]],
};

const COLORS = {
    1: "cyan",
    2: "yellow",
    3: "purple",
    4: "green",
    5: "red",
    6: "blue",
    7: "orange",
};

function randomPiece() {
    const keys = Object.keys(SHAPES);
    const key = keys[Math.floor(Math.random() * keys.length)];

    return {
        shape: SHAPES[key],
        color: COLORS[keys.indexOf(key)+1],
        x: 3,
        y: 0
    };
}

let piece = randomPiece();
let dropCounter = 0;
let dropInterval = 500;
let lastTime = 0;
let score = 0;

// ---- Collision check ----
function collide(piece, board) {
    for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
            if (piece.shape[r][c] === 1) {
                let newX = piece.x + c;
                let newY = piece.y + r;
                if (
                    newX < 0 || newX >= cols ||
                    newY >= rows ||
                    board[newY][newX] !== 0
                ) return true;
            }
        }
    }
    return false;
}

// ---- Merge piece into board ----
function mergePiece() {
    for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
            if (piece.shape[r][c] === 1) {
                board[piece.y + r][piece.x + c] = Object.values(COLORS).indexOf(piece.color)+1;
            }
        }
    }
}

// ---- Clear full lines ----
function clearLines() {
    let lines = 0;
    for (let r = rows-1; r >=0; r--) {
        if (board[r].every(cell => cell !== 0)) {
            board.splice(r,1); // remove full row
            board.unshift(Array(cols).fill(0)); // add empty row on top
            lines++;
            r++; // recheck same row index
        }
    }
    if (lines > 0) score += lines * 10;
    document.getElementById("score").innerText = "Score: " + score;
}

// ---- Rotate matrix ----
function rotate(piece) {
    const rotated = [];
    for (let c = 0; c < piece.shape[0].length; c++) {
        const row = [];
        for (let r = piece.shape.length-1; r>=0; r--) {
            row.push(piece.shape[r][c]);
        }
        rotated.push(row);
    }
    return rotated;
}

// ---- Wall kick ----
function rotateWithWallKick(piece) {
    const oldShape = piece.shape;
    piece.shape = rotate(piece);

    let offset = 1;
    while (collide(piece, board)) {
        piece.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (Math.abs(offset) > piece.shape[0].length) {
            piece.shape = oldShape;
            piece.x = Math.floor((cols - piece.shape[0].length)/2);
            return;
        }
    }
}

// ---- Draw everything ----
function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // draw board
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (board[r][c] !== 0) {
                ctx.fillStyle = COLORS[board[r][c]];
                ctx.fillRect(c*tileSize,r*tileSize,tileSize,tileSize);
            }
        }
    }

    // draw active piece
    ctx.fillStyle = piece.color;
    for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
            if (piece.shape[r][c] === 1) {
                ctx.fillRect((piece.x + c)*tileSize,(piece.y + r)*tileSize,tileSize,tileSize);
            }
        }
    }
}

// ---- Update loop ----
function update(time = 0) {
    const delta = time - lastTime;
    lastTime = time;

    dropCounter += delta;
    if (dropCounter > dropInterval) {
        piece.y++;
        if (collide(piece, board)) {
            piece.y--;
            mergePiece();
            clearLines();
            piece = randomPiece();
            if (collide(piece, board)) { // Game over
                alert("Game Over! Score: " + score);
                board = Array.from({ length: rows }, () => Array(cols).fill(0));
                score = 0;
                document.getElementById("score").innerText = "Score: 0";
            }
        }
        dropCounter = 0;
    }

    draw();
    requestAnimationFrame(update);
}

update();

// ---- Keyboard controls ----
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
        piece.x--;
        if (collide(piece, board)) piece.x++;
    }
    if (e.key === "ArrowRight") {
        piece.x++;
        if (collide(piece, board)) piece.x--;
    }
    if (e.key === "ArrowDown") {
        piece.y++;
        if (collide(piece, board)) {
            piece.y--;
            mergePiece();
            clearLines();
            piece = randomPiece();
        }
        dropCounter = 0;
    }
    if (e.key === "ArrowUp") {
        rotateWithWallKick(piece);
    }
});
