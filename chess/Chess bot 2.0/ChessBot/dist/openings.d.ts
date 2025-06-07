import { Chess } from 'chess.js';
export interface ChessOpening {
    name: string;
    moves: string[];
    fen: string;
    eco: string;
    description: string;
}
export declare const CHESS_OPENINGS: ChessOpening[];
/**
 * Recognize the opening from a game's moves
 * @param moves - Array of moves in algebraic notation
 * @returns Recognized opening or null if no match found
 */
export declare function recognizeOpening(moves: string[]): ChessOpening | null;
/**
 * Get all openings that could follow from the current position
 * @param moves - Current moves played
 * @returns Array of possible openings
 */
export declare function getPossibleOpenings(moves: string[]): ChessOpening[];
/**
 * Start a game from a specific opening
 * @param openingName - Name of the opening to start from
 * @returns Chess game instance set to the opening position, or null if opening not found
 */
export declare function startFromOpening(openingName: string): Chess | null;
/**
 * Get opening by ECO code
 * @param eco - ECO code (e.g., "C50", "B20")
 * @returns Opening with matching ECO code or null
 */
export declare function getOpeningByEco(eco: string): ChessOpening | null;
/**
 * Get all available openings
 * @returns Array of all chess openings
 */
export declare function getAllOpenings(): ChessOpening[];
/**
 * Get opening statistics from a game
 * @param moves - Array of moves in algebraic notation
 * @returns Opening analysis
 */
export declare function analyzeOpeningFromGame(moves: string[]): {
    recognized: ChessOpening | null;
    possible: ChessOpening[];
    movesInOpening: number;
    isStillInOpening: boolean;
};
/**
 * Get the next recommended move for an opening
 * @param moves - Current moves played
 * @param openingName - Name of the opening to follow
 * @returns Next move in the opening or null if not applicable
 */
export declare function getNextOpeningMove(moves: string[], openingName: string): string | null;
//# sourceMappingURL=openings.d.ts.map