import { Chess, Move } from 'chess.js';
import { PIECE_VALUES, PIECE_SQUARE_TABLES, KING_ENDGAME_TABLE } from './constants.js';
import { isEndgame, squareToIndices } from './utils.js';

export function evaluatePosition(game: Chess): number {
  if (game.isCheckmate()) {
    return game.turn() === 'w' ? -10000 : 10000;
  }
  
  if (game.isDraw()) {
    return 0;
  }

  let score = 0;
  const board = game.board();
  const endgame = isEndgame(game);

  // Evaluate material and position
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file];
      if (!piece) continue;

      const pieceValue = PIECE_VALUES[piece.type as keyof typeof PIECE_VALUES];
      const isWhite = piece.color === 'w';
      
      // Material value
      let pieceScore = pieceValue;
      
      // Positional value from piece-square tables
      const tableRow = isWhite ? 7 - rank : rank;
      const tableCol = file;
      
      if (piece.type === 'k' && endgame) {
        pieceScore += KING_ENDGAME_TABLE[tableRow][tableCol];
      } else {
        const table = PIECE_SQUARE_TABLES[piece.type];
        if (table) {
          pieceScore += table[tableRow][tableCol];
        }
      }
      
      score += isWhite ? pieceScore : -pieceScore;
    }
  }

  // Additional positional factors
  score += evaluateMobility(game);
  score += evaluateKingSafety(game);
  score += evaluatePawnStructure(game);

  return score;
}

function evaluateMobility(game: Chess): number {
  const currentPlayer = game.turn();
  const moves = game.moves().length;
  
  // Switch turns to get opponent's mobility
  const gameCopy = new Chess();
  const fenParts = game.fen().split(' ');
  
  // Switch the active color (second component of FEN)
  fenParts[1] = currentPlayer === 'w' ? 'b' : 'w';
  
  // Reconstruct the FEN string
  const modifiedFen = fenParts.join(' ');
  
  gameCopy.load(modifiedFen);
  const opponentMoves = gameCopy.moves().length;
  
  const mobilityScore = (moves - opponentMoves) * 2;
  return currentPlayer === 'w' ? mobilityScore : -mobilityScore;
}

function evaluateKingSafety(game: Chess): number {
  let safety = 0;
  const board = game.board();
  
  // Find kings
  let whiteKing: [number, number] | null = null;
  let blackKing: [number, number] | null = null;
  
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file];
      if (piece?.type === 'k') {
        if (piece.color === 'w') {
          whiteKing = [rank, file];
        } else {
          blackKing = [rank, file];
        }
      }
    }
  }
  
  // Simple king safety: penalize exposed kings
  if (whiteKing) {
    const [rank, file] = whiteKing;
    if (rank > 5) { // King on back ranks is safer
      safety += 10;
    }
    if (file > 0 && file < 7) { // King not on edge files
      safety += 5;
    }
  }
  
  if (blackKing) {
    const [rank, file] = blackKing;
    if (rank < 2) { // King on back ranks is safer
      safety -= 10;
    }
    if (file > 0 && file < 7) { // King not on edge files
      safety -= 5;
    }
  }
  
  return safety;
}

function evaluatePawnStructure(game: Chess): number {
  let structure = 0;
  const board = game.board();
  
  // Count doubled pawns, isolated pawns, etc.
  const whitePawnFiles: boolean[] = new Array(8).fill(false);
  const blackPawnFiles: boolean[] = new Array(8).fill(false);
  
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file];
      if (piece?.type === 'p') {
        if (piece.color === 'w') {
          if (whitePawnFiles[file]) {
            structure -= 10; // Doubled pawn penalty
          }
          whitePawnFiles[file] = true;
        } else {
          if (blackPawnFiles[file]) {
            structure += 10; // Doubled pawn penalty for black
          }
          blackPawnFiles[file] = true;
        }
      }
    }
  }
  
  return structure;
}

export function evaluateMove(game: Chess, move: string): number {
  const gameCopy = new Chess(game.fen());
  
  try {
    gameCopy.move(move);
    return evaluatePosition(gameCopy);
  } catch {
    return -Infinity;
  }
}