import { Chess } from 'chess.js';

export function getRandomMove(validMoves: string[]): string {
  return validMoves[Math.floor(Math.random() * validMoves.length)];
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function isEndgame(game: Chess): boolean {
  const fen = game.fen();
  const pieces = fen.split(' ')[0];
  
  // Count non-pawn, non-king pieces
  const pieceCount = pieces.replace(/[^rnbqRNBQ]/g, '').length;
  return pieceCount <= 6;
}

export function fileToNumber(file: string): number {
  return file.charCodeAt(0) - 'a'.charCodeAt(0);
}

export function rankToNumber(rank: string): number {
  return parseInt(rank) - 1;
}

export function squareToIndices(square: string): [number, number] {
  const file = fileToNumber(square[0]);
  const rank = rankToNumber(square[1]);
  return [rank, file];
}