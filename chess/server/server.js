const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

let gameState = {
    board: [
        'rnbqkbnr',
        'pppppppp',
        '........',
        '........',
        '........',
        '........',
        'PPPPPPPP',
        'RNBQKBNR'
    ].map(row => row.split('')),
    currentTurn: 'white',
    moveHistory: [],
    inCheck: false,
    castling: {
        'white': { 'kingMoved': false, 'kingRookMoved': false, 'queenRookMoved': false },
        'black': { 'kingMoved': false, 'kingRookMoved': false, 'queenRookMoved': false }
    },
    lastMove: null,
    players: [],
    gameOver: false
};

wss.on('connection', (ws) => {
    if (gameState.players.length < 2) {
        const color = gameState.players.length === 0 ? 'white' : 'black';
        gameState.players.push({ ws, color });
        ws.send(JSON.stringify({ type: 'init', color }));
        console.log(`Player ${color} connected`);

        if (gameState.players.length === 2) {
            broadcast({ type: 'start', gameState: { ...gameState, players: undefined } });
        }
    } else {
        ws.send(JSON.stringify({ type: 'error', message: 'Game is full' }));
        ws.close();
    }

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'move') {
            const player = gameState.players.find(p => p.ws === ws);
            if (player.color !== gameState.currentTurn || gameState.gameOver) return;

            const { piece, fromRow, fromCol, toRow, toCol } = data;
            if (isValidMove(gameState.board, piece, fromRow, fromCol, toRow, toCol, gameState)) {
                applyMove(gameState, piece, fromRow, fromCol, toRow, toCol);
                broadcast({ type: 'update', gameState: { ...gameState, players: undefined } });
            }
        } else if (data.type === 'promote') {
            const { choice } = data;
            if (gameState.promotionPending) {
                gameState.board[gameState.promotionPending.toRow][gameState.promotionPending.toCol] = 
                    gameState.currentTurn === 'white' ? choice.toLowerCase() : choice.toUpperCase();
                gameState.promotionPending = null;
                gameState.inCheck = isInCheck(gameState.board, gameState.currentTurn === 'white', gameState);
                gameState.currentTurn = gameState.currentTurn === 'white' ? 'black' : 'white';
                broadcast({ type: 'update', gameState: { ...gameState, players: undefined } });
            }
        }
    });

    ws.on('close', () => {
        gameState.players = gameState.players.filter(p => p.ws !== ws);
        console.log('Player disconnected');
        if (gameState.players.length < 2) {
            resetGameState();
            broadcast({ type: 'reset' });
        }
    });
});

function broadcast(data) {
    gameState.players.forEach(player => player.ws.send(JSON.stringify(data)));
}

function resetGameState() {
    gameState = {
        board: [
            'rnbqkbnr',
            'pppppppp',
            '........',
            '........',
            '........',
            '........',
            'PPPPPPPP',
            'RNBQKBNR'
        ].map(row => row.split('')),
        currentTurn: 'white',
        moveHistory: [],
        inCheck: false,
        castling: {
            'white': { 'kingMoved': false, 'kingRookMoved': false, 'queenRookMoved': false },
            'black': { 'kingMoved': false, 'kingRookMoved': false, 'queenRookMoved': false }
        },
        lastMove: null,
        players: gameState.players,
        gameOver: false
    };
}

function applyMove(gameState, piece, fromRow, fromCol, toRow, toCol) {
    const captured = gameState.board[toRow][toCol] !== '.' ? 'x' : '';
    const isEnPassant = piece.toLowerCase() === 'p' && Math.abs(toCol - fromCol) === 1 && gameState.board[toRow][toCol] === '.';
    let moveNotation = '';

    if (piece.toLowerCase() === 'k' && Math.abs(toCol - fromCol) === 2) {
        moveNotation = toCol === 6 ? 'O-O' : 'O-O-O';
        const rookFromCol = toCol === 6 ? 7 : 0;
        const rookToCol = toCol === 6 ? 5 : 3;
        gameState.board[fromRow][rookToCol] = gameState.board[fromRow][rookFromCol];
        gameState.board[fromRow][rookFromCol] = '.';
    } else if (isEnPassant) {
        moveNotation = `${piece}${String.fromCharCode(97 + fromCol)}${8 - fromRow}x${String.fromCharCode(97 + toCol)}${8 - toRow} e.p.`;
        gameState.board[fromRow][toCol] = '.';
    } else {
        moveNotation = `${piece}${String.fromCharCode(97 + fromCol)}${8 - fromRow}${captured}${String.fromCharCode(97 + toCol)}${8 - toRow}`;
    }

    gameState.board[toRow][toCol] = piece;
    gameState.board[fromRow][fromCol] = '.';

    if (piece.toLowerCase() === 'p' && (toRow === 0 || toRow === 7)) {
        gameState.promotionPending = { toRow, toCol };
    } else {
        gameState.lastMove = { piece, fromRow, fromCol, toRow, toCol };
        gameState.moveHistory.push(moveNotation);
        updateCastlingState(gameState, piece, fromRow, fromCol);
        gameState.inCheck = isInCheck(gameState.board, gameState.currentTurn === 'white', gameState);
        gameState.currentTurn = gameState.currentTurn === 'white' ? 'black' : 'white';
        if (isCheckmate(gameState)) gameState.gameOver = true;
    }
}

// Используем функции из pieces.js
const { isValidMove, isInCheck, updateCastlingState, isCheckmate } = require('./../client/pieces.js');

console.log('Server running on ws://localhost:8080');