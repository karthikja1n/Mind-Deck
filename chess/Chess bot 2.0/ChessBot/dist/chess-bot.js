import { getEasyMove, getMediumMove, getHardMove } from './strategies.js';
/**
 * Get the best move for the current position based on difficulty level
 * @param game - Chess.js game instance
 * @param difficulty - AI difficulty level ('easy', 'medium', 'hard')
 * @returns The best move in algebraic notation
 */
export function getBestMove(game, difficulty) {
    if (game.isGameOver()) {
        throw new Error('Game is over, no moves available');
    }
    const moves = game.moves();
    if (moves.length === 0) {
        throw new Error('No legal moves available');
    }
    switch (difficulty) {
        case 'easy':
            return getEasyMove(game);
        case 'medium':
            return getMediumMove(game);
        case 'hard':
            return getHardMove(game);
        default:
            throw new Error(`Invalid difficulty level: ${difficulty}`);
    }
}
// Export all types and utilities for external use
export * from './types.js';
export { evaluatePosition } from './evaluation.js';
export { minimax } from './minimax.js';
// Export new features
export { getEvaluationBar, getEvaluationChange } from './evaluation-bar.js';
export { checkBlunder, analyzeGameForBlunders, getBlunderStats } from './blunder-detection.js';
export { recognizeOpening, getPossibleOpenings, startFromOpening, getOpeningByEco, getAllOpenings, analyzeOpeningFromGame, getNextOpeningMove } from './openings.js';
//# sourceMappingURL=chess-bot.js.map