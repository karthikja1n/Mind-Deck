import { Chess } from 'chess.js';
export interface BlunderResult {
    isBlunder: boolean;
    severity: 'minor' | 'moderate' | 'major' | 'critical';
    evaluationDrop: number;
    reason: string;
    bestMove?: string;
}
export interface BlunderThresholds {
    minor: number;
    moderate: number;
    major: number;
    critical: number;
}
/**
 * Check if a move is a blunder
 * @param game - Game state before the move
 * @param move - The move to check
 * @param depth - Search depth for finding best alternative (default: 3)
 * @param thresholds - Custom blunder thresholds
 * @returns Blunder analysis result
 */
export declare function checkBlunder(game: Chess, move: string, depth?: number, thresholds?: BlunderThresholds): BlunderResult;
/**
 * Analyze a completed game for blunders
 * @param moves - Array of moves in algebraic notation
 * @param startingFen - Starting position (optional, defaults to standard starting position)
 * @returns Array of blunder results for each move
 */
export declare function analyzeGameForBlunders(moves: string[], startingFen?: string): BlunderResult[];
/**
 * Get blunder statistics for a game
 * @param blunders - Array of blunder results
 * @returns Statistics about blunders in the game
 */
export declare function getBlunderStats(blunders: BlunderResult[]): {
    total: number;
    minor: number;
    moderate: number;
    major: number;
    critical: number;
    averageEvaluationDrop: number;
};
//# sourceMappingURL=blunder-detection.d.ts.map