import { Chess } from 'chess.js';
export const CHESS_OPENINGS = [
    {
        name: "Italian Game",
        moves: ["e4", "e5", "Nf3", "Nc6", "Bc4"],
        fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
        eco: "C50",
        description: "One of the oldest chess openings, focusing on rapid development and central control"
    },
    {
        name: "Ruy Lopez",
        moves: ["e4", "e5", "Nf3", "Nc6", "Bb5"],
        fen: "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
        eco: "C60",
        description: "Named after Spanish priest Ruy López, this opening puts pressure on Black's center"
    },
    {
        name: "Sicilian Defense",
        moves: ["e4", "c5"],
        fen: "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2",
        eco: "B20",
        description: "The most popular response to 1.e4, leading to sharp, tactical games"
    },
    {
        name: "French Defense",
        moves: ["e4", "e6"],
        fen: "rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
        eco: "C00",
        description: "A solid defense that often leads to closed, strategic positions"
    },
    {
        name: "Queen's Gambit",
        moves: ["d4", "d5", "c4"],
        fen: "rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2",
        eco: "D06",
        description: "A classical opening offering a pawn to gain central control"
    },
    {
        name: "King's Indian Defense",
        moves: ["d4", "Nf6", "c4", "g6", "Nc3", "Bg7"],
        fen: "rnbqk2r/pppppbpp/5np1/8/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4",
        eco: "E60",
        description: "A hypermodern defense allowing White central control while preparing counterplay"
    },
    {
        name: "English Opening",
        moves: ["c4"],
        fen: "rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq c3 0 1",
        eco: "A10",
        description: "A flexible opening that can transpose into many different pawn structures"
    },
    {
        name: "Caro-Kann Defense",
        moves: ["e4", "c6"],
        fen: "rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
        eco: "B10",
        description: "A solid defense similar to the French but avoiding the blocked light-squared bishop"
    },
    {
        name: "Nimzo-Indian Defense",
        moves: ["d4", "Nf6", "c4", "e6", "Nc3", "Bb4"],
        fen: "rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4",
        eco: "E20",
        description: "A hypermodern defense that immediately challenges White's central control"
    },
    {
        name: "Scandinavian Defense",
        moves: ["e4", "d5"],
        fen: "rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2",
        eco: "B01",
        description: "An aggressive defense that immediately challenges White's central pawn"
    }
];
/**
 * Recognize the opening from a game's moves
 * @param moves - Array of moves in algebraic notation
 * @returns Recognized opening or null if no match found
 */
export function recognizeOpening(moves) {
    // Find the longest matching opening
    let bestMatch = null;
    let maxMatchLength = 0;
    for (const opening of CHESS_OPENINGS) {
        if (opening.moves.length <= moves.length && opening.moves.length > maxMatchLength) {
            // Check if all opening moves match the game moves
            const matches = opening.moves.every((move, index) => move === moves[index]);
            if (matches) {
                bestMatch = opening;
                maxMatchLength = opening.moves.length;
            }
        }
    }
    return bestMatch;
}
/**
 * Get all openings that could follow from the current position
 * @param moves - Current moves played
 * @returns Array of possible openings
 */
export function getPossibleOpenings(moves) {
    return CHESS_OPENINGS.filter(opening => {
        if (opening.moves.length <= moves.length) {
            return false;
        }
        // Check if current moves match the beginning of this opening
        return moves.every((move, index) => move === opening.moves[index]);
    });
}
/**
 * Start a game from a specific opening
 * @param openingName - Name of the opening to start from
 * @returns Chess game instance set to the opening position, or null if opening not found
 */
export function startFromOpening(openingName) {
    const opening = CHESS_OPENINGS.find(o => o.name.toLowerCase() === openingName.toLowerCase());
    if (!opening) {
        return null;
    }
    const game = new Chess();
    try {
        for (const move of opening.moves) {
            game.move(move);
        }
        return game;
    }
    catch (error) {
        // Invalid moves in opening definition
        return null;
    }
}
/**
 * Get opening by ECO code
 * @param eco - ECO code (e.g., "C50", "B20")
 * @returns Opening with matching ECO code or null
 */
export function getOpeningByEco(eco) {
    return CHESS_OPENINGS.find(opening => opening.eco === eco) || null;
}
/**
 * Get all available openings
 * @returns Array of all chess openings
 */
export function getAllOpenings() {
    return [...CHESS_OPENINGS];
}
/**
 * Get opening statistics from a game
 * @param moves - Array of moves in algebraic notation
 * @returns Opening analysis
 */
export function analyzeOpeningFromGame(moves) {
    const recognizedOpening = recognizeOpening(moves);
    const possibleOpenings = getPossibleOpenings(moves);
    return {
        recognized: recognizedOpening,
        possible: possibleOpenings,
        movesInOpening: recognizedOpening ? recognizedOpening.moves.length : 0,
        isStillInOpening: possibleOpenings.length > 0
    };
}
/**
 * Get the next recommended move for an opening
 * @param moves - Current moves played
 * @param openingName - Name of the opening to follow
 * @returns Next move in the opening or null if not applicable
 */
export function getNextOpeningMove(moves, openingName) {
    const opening = CHESS_OPENINGS.find(o => o.name.toLowerCase() === openingName.toLowerCase());
    if (!opening || moves.length >= opening.moves.length) {
        return null;
    }
    // Check if current moves match the opening so far
    const matches = moves.every((move, index) => move === opening.moves[index]);
    if (!matches) {
        return null;
    }
    return opening.moves[moves.length];
}
//# sourceMappingURL=openings.js.map