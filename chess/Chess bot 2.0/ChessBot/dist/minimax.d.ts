import { Chess } from 'chess.js';
export interface MinimaxResult {
    score: number;
    bestMove: string | null;
}
export declare function minimax(game: Chess, depth: number, maximizingPlayer: boolean, alpha?: number, beta?: number): MinimaxResult;
//# sourceMappingURL=minimax.d.ts.map