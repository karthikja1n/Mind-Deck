import { Chess } from 'chess.js';
import { evaluatePosition } from './evaluation.js';
import { shuffleArray } from './utils.js';
export function minimax(game, depth, maximizingPlayer, alpha = -Infinity, beta = Infinity) {
    if (depth === 0 || game.isGameOver()) {
        return {
            score: evaluatePosition(game),
            bestMove: null
        };
    }
    const moves = shuffleArray(game.moves());
    let bestMove = null;
    if (maximizingPlayer) {
        let maxEval = -Infinity;
        for (const move of moves) {
            const gameCopy = new Chess(game.fen());
            gameCopy.move(move);
            const evaluation = minimax(gameCopy, depth - 1, false, alpha, beta);
            if (evaluation.score > maxEval) {
                maxEval = evaluation.score;
                bestMove = move;
            }
            alpha = Math.max(alpha, evaluation.score);
            if (beta <= alpha) {
                break; // Alpha-beta pruning
            }
        }
        return { score: maxEval, bestMove };
    }
    else {
        let minEval = Infinity;
        for (const move of moves) {
            const gameCopy = new Chess(game.fen());
            gameCopy.move(move);
            const evaluation = minimax(gameCopy, depth - 1, true, alpha, beta);
            if (evaluation.score < minEval) {
                minEval = evaluation.score;
                bestMove = move;
            }
            beta = Math.min(beta, evaluation.score);
            if (beta <= alpha) {
                break; // Alpha-beta pruning
            }
        }
        return { score: minEval, bestMove };
    }
}
//# sourceMappingURL=minimax.js.map