import { evaluatePosition } from './evaluation.js';
/**
 * Get evaluation score for the current position
 * @param game - Chess.js game instance
 * @returns Evaluation result with score and advantage information
 */
export function getEvaluationBar(game) {
    const rawScore = evaluatePosition(game);
    // Convert centipawn score to pawn units (divide by 100)
    const pawnsAdvantage = Math.round(rawScore / 100 * 10) / 10; // Round to 1 decimal
    let advantage;
    if (Math.abs(pawnsAdvantage) < 0.1) {
        advantage = 'equal';
    }
    else if (pawnsAdvantage > 0) {
        advantage = 'white';
    }
    else {
        advantage = 'black';
    }
    return {
        score: rawScore,
        advantage,
        pawnsAdvantage
    };
}
/**
 * Get evaluation change after a move
 * @param gameBefore - Game state before the move
 * @param gameAfter - Game state after the move
 * @returns Change in evaluation
 */
export function getEvaluationChange(gameBefore, gameAfter) {
    const beforeEval = evaluatePosition(gameBefore);
    const afterEval = evaluatePosition(gameAfter);
    // Return change from the perspective of the player who just moved
    const currentPlayer = gameBefore.turn();
    const change = afterEval - beforeEval;
    return currentPlayer === 'w' ? change : -change;
}
//# sourceMappingURL=evaluation-bar.js.map