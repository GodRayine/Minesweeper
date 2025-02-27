const initialBoard = [
    'rnbqkbnr',
    'pppppppp',
    '........',
    '........',
    '........',
    '........',
    'PPPPPPPP',
    'RNBQKBNR'
];

function createBoard(gameState) {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    gameState.board = gameState.board || initialBoard.map(row => row.split(''));

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
            square.dataset.row = row;
            square.dataset.col = col;

            const piece = gameState.board[row][col];
            if (piece !== '.') {
                const pieceElement = document.createElement('span');
                pieceElement.className = 'piece';
                pieceElement.draggable = true;
                pieceElement.innerHTML = pieces[piece];
                square.appendChild(pieceElement);
            }

            square.addEventListener('dragover', (e) => dragOver(e));
            square.addEventListener('drop', (e) => drop(e, gameState));
            grid.appendChild(square);
        }
    }

    const rankLabels = document.querySelector('.rank-labels');
    rankLabels.innerHTML = '';
    for (let i = 8; i >= 1; i--) {
        const label = document.createElement('div');
        label.textContent = i;
        rankLabels.appendChild(label);
    }

    const fileLabels = document.querySelector('.file-labels');
    fileLabels.innerHTML = '';
    for (let i = 0; i < 8; i++) {
        const label = document.createElement('div');
        label.textContent = String.fromCharCode(97 + i);
        fileLabels.appendChild(label);
    }
}

function addPieceListeners(gameState) {
    document.querySelectorAll('.piece').forEach(piece => {
        piece.addEventListener('dragstart', (e) => dragStart(e, gameState));
    });
}

function dragStart(e, gameState) {
    if (e.target.classList.contains('piece') && gameState.playerColor === gameState.currentTurn) {
        const fromSquare = e.target.parentElement;
        const fromRow = parseInt(fromSquare.dataset.row);
        const fromCol = parseInt(fromSquare.dataset.col);
        const piece = gameState.board[fromRow][fromCol];
        const isWhite = piece === piece.toUpperCase();

        if ((gameState.currentTurn === 'white' && isWhite) || (gameState.currentTurn === 'black' && !isWhite)) {
            gameState.selectedPiece = e.target;
            e.dataTransfer.setData('text/plain', 'piece');
        }
    }
}

function dragOver(e) {
    e.preventDefault();
}

function drop(e, gameState) {
    e.preventDefault();
    if (!gameState.selectedPiece || gameState.playerColor !== gameState.currentTurn) return;

    const fromSquare = gameState.selectedPiece.parentElement;
    const toSquare = e.target.classList.contains('square') ? e.target : e.target.parentElement;
    const fromRow = parseInt(fromSquare.dataset.row);
    const fromCol = parseInt(fromSquare.dataset.col);
    const toRow = parseInt(toSquare.dataset.row);
    const toCol = parseInt(toSquare.dataset.col);
    const piece = gameState.board[fromRow][fromCol];

    if (isValidMove(gameState.board, piece, fromRow, fromCol, toRow, toCol, gameState)) {
        gameState.ws.send(JSON.stringify({
            type: 'move',
            piece,
            fromRow,
            fromCol,
            toRow,
            toCol
        }));
    }

    gameState.selectedPiece = null;
}