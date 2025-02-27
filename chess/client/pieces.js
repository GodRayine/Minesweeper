const pieces = {
    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
};

function isPathClear(board, fromRow, fromCol, toRow, toCol) {
    const rowStep = Math.sign(toRow - fromRow);
    const colStep = Math.sign(toCol - fromCol);
    let row = fromRow + rowStep;
    let col = fromCol + colStep;

    while (row !== toRow || col !== toCol) {
        if (board[row][col] !== '.') return false;
        row += rowStep;
        col += colStep;
    }
    return true;
}

function isValidMove(board, piece, fromRow, fromCol, toRow, toCol, gameState, checkForCheck = true) {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    const target = board[toRow][toCol];
    const isWhite = piece === piece.toUpperCase();
    const isCapture = target !== '.' && (isWhite !== (target === target.toUpperCase()));
    const direction = isWhite ? -1 : 1;

    if ((gameState.currentTurn === 'white' && !isWhite) || (gameState.currentTurn === 'black' && isWhite)) return false;

    let valid = false;
    switch (piece.toLowerCase()) {
        case 'p':
            if (colDiff === 0 && target === '.') {
                if (rowDiff === 1 && toRow === fromRow + direction) valid = true;
                if (rowDiff === 2 && (isWhite ? fromRow === 6 : fromRow === 1) && toRow === fromRow + 2 * direction) {
                    valid = board[fromRow + direction][fromCol] === '.';
                }
            }
            if (rowDiff === 1 && colDiff === 1 && toRow === fromRow + direction && isCapture) valid = true;
            // En passant
            if (rowDiff === 1 && colDiff === 1 && toRow === fromRow + direction && target === '.' &&
                gameState.lastMove && gameState.lastMove.piece.toLowerCase() === 'p' &&
                Math.abs(gameState.lastMove.fromRow - gameState.lastMove.toRow) === 2 &&
                gameState.lastMove.toCol === toCol && gameState.lastMove.toRow === fromRow) {
                valid = true;
            }
            break;
        case 'r':
            valid = (rowDiff === 0 || colDiff === 0) && isPathClear(board, fromRow, fromCol, toRow, toCol);
            break;
        case 'n':
            valid = (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
            break;
        case 'b':
            valid = rowDiff === colDiff && isPathClear(board, fromRow, fromCol, toRow, toCol);
            break;
        case 'q':
            valid = ((rowDiff === 0 || colDiff === 0) || (rowDiff === colDiff)) && isPathClear(board, fromRow, fromCol, toRow, toCol);
            break;
        case 'k':
            if (rowDiff <= 1 && colDiff <= 1) valid = true;
            else if (rowDiff === 0 && colDiff === 2 && !gameState.castling[gameState.currentTurn].kingMoved) {
                if (toCol === 6 && !gameState.castling[gameState.currentTurn].kingRookMoved &&
                    board[fromRow][5] === '.' && board[fromRow][6] === '.' &&
                    !isInCheck(board, isWhite, gameState) && !wouldBeInCheckAfterMove(board, fromRow, 5, isWhite, gameState)) {
                    valid = true;
                } else if (toCol === 2 && !gameState.castling[gameState.currentTurn].queenRookMoved &&
                    board[fromRow][1] === '.' && board[fromRow][2] === '.' && board[fromRow][3] === '.' &&
                    !isInCheck(board, isWhite, gameState) && !wouldBeInCheckAfterMove(board, fromRow, 3, isWhite, gameState)) {
                    valid = true;
                }
            }
            break;
    }

    if (valid && (target === '.' || isCapture || (piece.toLowerCase() === 'p' && colDiff === 1))) {
        if (checkForCheck) {
            const tempBoard = board.map(row => [...row]);
            tempBoard[toRow][toCol] = piece;
            tempBoard[fromRow][fromCol] = '.';
            if (piece.toLowerCase() === 'k' && colDiff === 2) {
                const rookFromCol = toCol === 6 ? 7 : 0;
                const rookToCol = toCol === 6 ? 5 : 3;
                tempBoard[fromRow][rookToCol] = tempBoard[fromRow][rookFromCol];
                tempBoard[fromRow][rookFromCol] = '.';
            }
            if (piece.toLowerCase() === 'p' && colDiff === 1 && target === '.' && rowDiff === 1) {
                tempBoard[fromRow][toCol] = '.'; // En passant capture
            }
            return !wouldBeInCheck(tempBoard, isWhite, gameState);
        }
        return true;
    }
    return false;
}

function findKing(board, isWhite) {
    const king = isWhite ? 'K' : 'k';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (board[row][col] === king) return [row, col];
        }
    }
}

function isInCheck(board, isWhite, gameState) {
    const [kingRow, kingCol] = findKing(board, isWhite);
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece !== '.' && (piece === piece.toUpperCase()) !== isWhite) {
                if (isValidMove(board, piece, row, col, kingRow, kingCol, gameState, false)) {
                    return true;
                }
            }
        }
    }
    return false;
}

function wouldBeInCheckAfterMove(board, row, col, isWhite, gameState) {
    const tempBoard = board.map(row => [...row]);
    tempBoard[row][col] = isWhite ? 'K' : 'k';
    tempBoard[row][4] = '.';
    return isInCheck(tempBoard, isWhite, gameState);
}

function wouldBeInCheck(board, isWhite, gameState) {
    return isInCheck(board, isWhite, gameState);
}