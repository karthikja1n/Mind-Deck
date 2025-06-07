import { Chess } from 'chess.js';
export interface EvaluationResult {
    score: number;
    advantage: 'white' | 'black' | 'equal';
    pawnsAdvantage: number;
}
/**
 * Get evaluation score for the current position
 * @param game - Chess.js game instance
 * @returns Evaluation result with score and advantage information
 */
export declare function getEvaluationBar(game: Chess): EvaluationResult;
/**
 * Get evaluation change after a move
 * @param gameBefore - Game state before the move
 * @param gameAfter - Game state after the move
 * @returns Change in evaluation
 */
export declare function getEvaluationChange(gameBefore: Chess, gameAfter: Chess): number;
//# sourceMappingURL=evaluation-bar.d.ts.map