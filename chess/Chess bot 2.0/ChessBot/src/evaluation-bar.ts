import { Chess } from 'chess.js';
import { evaluatePosition } from './evaluation.js';

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
export function getEvaluationBar(game: Chess): EvaluationResult {
  const rawScore = evaluatePosition(game);
  
  // Convert centipawn score to pawn units (divide by 100)
  const pawnsAdvantage = Math.round(rawScore / 100 * 10) / 10; // Round to 1 decimal
  
  let advantage: 'white' | 'black' | 'equal';
  if (Math.abs(pawnsAdvantage) < 0.1) {
    advantage = 'equal';
  } else if (pawnsAdvantage > 0) {
    advantage = 'white';
  } else {
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
export function getEvaluationChange(gameBefore: Chess, gameAfter: Chess): number {
  const beforeEval = evaluatePosition(gameBefore);
  const afterEval = evaluatePosition(gameAfter);
  
  // Return change from the perspective of the player who just moved
  const currentPlayer = gameBefore.turn();
  const change = afterEval - beforeEval;
  
  return currentPlayer === 'w' ? change : -change;
}