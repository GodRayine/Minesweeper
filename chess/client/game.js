let gameState = {
    board: [],
    selectedPiece: null,
    currentTurn: 'white',
    moveHistory: [],
    inCheck: false,
    gameOver: false,
    castling: { 
        'white': { 'kingMoved': false, 'kingRookMoved': false, 'queenRookMoved': false },
        'black': { 'kingMoved': false, 'kingRookMoved': false, 'queenRookMoved': false } 
    },
    lastMove: null,
    promotionPending: null,
    playerColor: null,
    ws: null
};

function startGame() {
    hideElement('menu');
    showElement('game');
    connectToServer();
}

function connectToServer() {
    gameState.ws = new WebSocket('ws://localhost:8080');

    gameState.ws.onopen = () => {
        console.log('Connected to server');
    };

    gameState.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        switch (data.type) {
            case 'init':
                gameState.playerColor = data.color;
                updateGameInfo(gameState);
                break;
            case 'start':
            case 'update':
                Object.assign(gameState, data.gameState);
                createBoard(gameState);
                addPieceListeners(gameState);
                updateGame(gameState);
                if (gameState.promotionPending && gameState.playerColor === gameState.currentTurn) {
                    showElement('promotion-menu');
                }
                break;
            case 'reset':
                resetGame();
                break;
            case 'error':
                alert(data.message);
                goToMenu();
                break;
        }
    };

    gameState.ws.onclose = () => {
        console.log('Disconnected from server');
        goToMenu();
    };
}

function resetGame() {
    gameState.board = [];
    gameState.selectedPiece = null;
    gameState.currentTurn = 'white';
    gameState.moveHistory = [];
    gameState.inCheck = false;
    gameState.gameOver = false;
    gameState.castling = {
        'white': { 'kingMoved': false, 'kingRookMoved': false, 'queenRookMoved': false },
        'black': { 'kingMoved': false, 'kingRookMoved': false, 'queenRookMoved': false }
    };
    gameState.lastMove = null;
    gameState.promotionPending = null;
    createBoard(gameState);
    addPieceListeners(gameState);
    updateGame(gameState);
}

function goToMenu() {
    hideElement('game');
    showElement('menu');
    gameState.gameOver = false;
    if (gameState.ws) gameState.ws.close();
}

function updateGame(gameState) {
    updateGameInfo(gameState);
    updateMoveHistory(gameState);
    if (!gameState.promotionPending) hideElement('promotion-menu');
}

function updateGameInfo(gameState) {
    const indicator = document.getElementById('turn-indicator');
    let status = `${gameState.currentTurn.charAt(0).toUpperCase() + gameState.currentTurn.slice(1)} (${gameState.playerColor})`;
    if (gameState.inCheck) status += ' - Check!';
    if (gameState.gameOver) status = `${gameState.currentTurn === 'white' ? 'Black' : 'White'} wins by checkmate!`;
    indicator.textContent = status;
}

function updateMoveHistory(gameState) {
    const history = document.getElementById('move-history');
    history.innerHTML = '<strong>Move History:</strong><br>' + 
        gameState.moveHistory.map((move, i) => `${i + 1}. ${move}`).join('<br>');
}

function promotePawn(choice) {
    if (!gameState.promotionPending || gameState.playerColor !== gameState.currentTurn) return;
    gameState.ws.send(JSON.stringify({ type: 'promote', choice }));
}