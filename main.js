const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const tileSize = 30;
const rows = 20;
const cols = 10;

// Create empty board (2D array)
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

// colors
const COLORS = {
    1: "cyan",
    2: "yellow",
    3: "purple",
    4: "green",
    5: "red",
    6: "blue",
    7: "orange",
};

// pick random shape
function randomPiece() {
    const keys = Object.keys(SHAPES);
    const key = keys[Math.floor(Math.random() * keys.length)];

    return {
        shape: SHAPES[key],
        color: COLORS[keys.indexOf(key) + 1],
        x: 3,
        y: 0
    };
}

let piece = randomPiece();
let dropCounter = 0;
let dropInterval = 500; // ms

let lastTime = 0;

function collide(piece, board) {
    for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
            if (piece.shape[r][c] === 1) {
                let newX = piece.x + c;
                let newY = piece.y + r;

                // out of bounds OR touching filled cell
                if (
                    newX < 0 || newX >= cols ||
                    newY >= rows || 
                    board[newY] && board[newY][newX] !== 0
                ) {
                    return true;
                }
            }
        }
    }
    return false;
}

function mergePiece() {
    for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
            if (piece.shape[r][c] === 1) {
                board[piece.y + r][piece.x + c] = Object.values(COLORS).indexOf(piece.color) + 1;
            }
        }
    }
}

function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw board
    for(let r = 0; r < rows; r++){
        for(let c = 0; c < cols; c++){
            if(board[r][c] !== 0){
                ctx.fillStyle = COLORS[board[r][c]];
                ctx.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }

    // draw active piece
    ctx.fillStyle = piece.color;
    for(let r = 0; r < piece.shape.length; r++){
        for(let c = 0; c < piece.shape[r].length; c++){
            if(piece.shape[r][c] === 1){
                ctx.fillRect((piece.x + c) * tileSize, (piece.y + r) * tileSize, tileSize, tileSize);
            }
        }
    }
}

function update(time = 0) {
    const delta = time - lastTime;
    lastTime = time;

    dropCounter += delta;
    if (dropCounter > dropInterval) {
        piece.y++;

        if (collide(piece, board)) {
            piece.y--;            // move back up
            mergePiece();         // lock in
            piece = randomPiece(); // new piece
        }

        dropCounter = 0;
    }

    draw();
    requestAnimationFrame(update);
}

update();

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
        piece.x--;
        if (collide(piece, board)) {
            piece.x++; 
        }
    }

    if (e.key === "ArrowRight") {
        piece.x++;
        if (collide(piece, board)) {
            piece.x--; 
        }
    }

    if (e.key === "ArrowDown") {
        piece.y++;
        if (collide(piece, board)) {
            piece.y--; 
            mergePiece();
            piece = randomPiece();
        }
        dropCounter = 0; 
    }
});
