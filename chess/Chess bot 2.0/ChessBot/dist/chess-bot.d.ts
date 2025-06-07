import { Chess } from 'chess.js';
import { Difficulty } from './types.js';
/**
 * Get the best move for the current position based on difficulty level
 * @param game - Chess.js game instance
 * @param difficulty - AI difficulty level ('easy', 'medium', 'hard')
 * @returns The best move in algebraic notation
 */
export declare function getBestMove(game: Chess, difficulty: Difficulty): string;
export * from './types.js';
export { evaluatePosition } from './evaluation.js';
export { minimax } from './minimax.js';
export { getEvaluationBar, getEvaluationChange } from './evaluation-bar.js';
export { checkBlunder, analyzeGameForBlunders, getBlunderStats } from './blunder-detection.js';
export { recognizeOpening, getPossibleOpenings, startFromOpening, getOpeningByEco, getAllOpenings, analyzeOpeningFromGame, getNextOpeningMove } from './openings.js';
//# sourceMappingURL=chess-bot.d.ts.map