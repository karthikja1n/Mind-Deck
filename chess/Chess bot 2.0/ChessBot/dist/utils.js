export function getRandomMove(validMoves) {
    return validMoves[Math.floor(Math.random() * validMoves.length)];
}
export function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
export function isEndgame(game) {
    const fen = game.fen();
    const pieces = fen.split(' ')[0];
    // Count non-pawn, non-king pieces
    const pieceCount = pieces.replace(/[^rnbqRNBQ]/g, '').length;
    return pieceCount <= 6;
}
export function fileToNumber(file) {
    return file.charCodeAt(0) - 'a'.charCodeAt(0);
}
export function rankToNumber(rank) {
    return parseInt(rank) - 1;
}
export function squareToIndices(square) {
    const file = fileToNumber(square[0]);
    const rank = rankToNumber(square[1]);
    return [rank, file];
}
//# sourceMappingURL=utils.js.map