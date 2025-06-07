import { Chess } from 'chess.js';
import { Difficulty } from './types.js';
import { getRandomMove, shuffleArray } from './utils.js';
import { evaluateMove } from './evaluation.js';
import { minimax } from './minimax.js';

export function getEasyMove(game: Chess): string {
  const moves = game.moves();
  
  // 70% chance of random move, 30% chance of slightly better move
  if (Math.random() < 0.7) {
    return getRandomMove(moves);
  }
  
  // Simple evaluation: avoid obviously bad moves
  const safeMoves = moves.filter(move => {
    const gameCopy = new Chess(game.fen());
    gameCopy.move(move);
    
    // Check if move puts own king in check (invalid moves are filtered by chess.js)
    // Check if move loses material immediately
    const evaluation = evaluateMove(game, move);
    return evaluation > -500; // Don't make moves that lose significant material
  });
  
  return getRandomMove(safeMoves.length > 0 ? safeMoves : moves);
}

export function getMediumMove(game: Chess): string {
  const isMaximizing = game.turn() === 'w';
  const result = minimax(game, 3, isMaximizing);
  
  if (result.bestMove) {
    return result.bestMove;
  }
  
  // Fallback to best single-move evaluation
  return getBestSingleMove(game);
}

export function getHardMove(game: Chess): string {
  const isMaximizing = game.turn() === 'w';
  const result = minimax(game, 5, isMaximizing);
  
  if (result.bestMove) {
    return result.bestMove;
  }
  
  // Fallback to best single-move evaluation
  return getBestSingleMove(game);
}

function getBestSingleMove(game: Chess): string {
  const moves = game.moves();
  let bestMove = moves[0];
  let bestScore = -Infinity;
  
  for (const move of moves) {
    const score = evaluateMove(game, move);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  
  return bestMove;
}