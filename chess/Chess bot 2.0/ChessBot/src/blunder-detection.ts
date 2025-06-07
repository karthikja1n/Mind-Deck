import { Chess } from 'chess.js';
import { evaluatePosition, evaluateMove } from './evaluation.js';
import { minimax } from './minimax.js';

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

const DEFAULT_THRESHOLDS: BlunderThresholds = {
  minor: 50,     // 0.5 pawns
  moderate: 150,  // 1.5 pawns
  major: 300,     // 3 pawns
  critical: 500   // 5 pawns
};

/**
 * Check if a move is a blunder
 * @param game - Game state before the move
 * @param move - The move to check
 * @param depth - Search depth for finding best alternative (default: 3)
 * @param thresholds - Custom blunder thresholds
 * @returns Blunder analysis result
 */
export function checkBlunder(
  game: Chess, 
  move: string, 
  depth: number = 3,
  thresholds: BlunderThresholds = DEFAULT_THRESHOLDS
): BlunderResult {
  // Get the best move according to the engine
  const isMaximizing = game.turn() === 'w';
  const bestResult = minimax(game, depth, isMaximizing);
  
  if (!bestResult.bestMove) {
    return {
      isBlunder: false,
      severity: 'minor',
      evaluationDrop: 0,
      reason: 'No best move found'
    };
  }
  
  // Evaluate the played move vs the best move
  const playedMoveEval = evaluateMove(game, move);
  const bestMoveEval = bestResult.score;
  
  // Calculate evaluation drop (always positive for worse moves)
  const evaluationDrop = Math.abs(bestMoveEval - playedMoveEval);
  
  // Determine if it's a blunder and its severity
  let isBlunder = false;
  let severity: 'minor' | 'moderate' | 'major' | 'critical' = 'minor';
  let reason = '';
  
  if (evaluationDrop >= thresholds.critical) {
    isBlunder = true;
    severity = 'critical';
    reason = `Critical blunder! Lost ${(evaluationDrop / 100).toFixed(1)} pawns of advantage`;
  } else if (evaluationDrop >= thresholds.major) {
    isBlunder = true;
    severity = 'major';
    reason = `Major blunder! Lost ${(evaluationDrop / 100).toFixed(1)} pawns of advantage`;
  } else if (evaluationDrop >= thresholds.moderate) {
    isBlunder = true;
    severity = 'moderate';
    reason = `Moderate blunder. Lost ${(evaluationDrop / 100).toFixed(1)} pawns of advantage`;
  } else if (evaluationDrop >= thresholds.minor) {
    isBlunder = true;
    severity = 'minor';
    reason = `Minor inaccuracy. Lost ${(evaluationDrop / 100).toFixed(1)} pawns of advantage`;
  } else {
    reason = 'Good move';
  }
  
  return {
    isBlunder,
    severity,
    evaluationDrop,
    reason,
    bestMove: bestResult.bestMove
  };
}

/**
 * Analyze a completed game for blunders
 * @param moves - Array of moves in algebraic notation
 * @param startingFen - Starting position (optional, defaults to standard starting position)
 * @returns Array of blunder results for each move
 */
export function analyzeGameForBlunders(
  moves: string[], 
  startingFen?: string
): BlunderResult[] {
  const game = new Chess(startingFen);
  const blunders: BlunderResult[] = [];
  
  for (const move of moves) {
    const blunderResult = checkBlunder(game, move);
    blunders.push(blunderResult);
    
    try {
      game.move(move);
    } catch (error) {
      // Invalid move, stop analysis
      break;
    }
  }
  
  return blunders;
}

/**
 * Get blunder statistics for a game
 * @param blunders - Array of blunder results
 * @returns Statistics about blunders in the game
 */
export function getBlunderStats(blunders: BlunderResult[]) {
  const stats = {
    total: blunders.filter(b => b.isBlunder).length,
    minor: blunders.filter(b => b.isBlunder && b.severity === 'minor').length,
    moderate: blunders.filter(b => b.isBlunder && b.severity === 'moderate').length,
    major: blunders.filter(b => b.isBlunder && b.severity === 'major').length,
    critical: blunders.filter(b => b.isBlunder && b.severity === 'critical').length,
    averageEvaluationDrop: 0
  };
  
  if (stats.total > 0) {
    const totalDrop = blunders
      .filter(b => b.isBlunder)
      .reduce((sum, b) => sum + b.evaluationDrop, 0);
    stats.averageEvaluationDrop = totalDrop / stats.total;
  }
  
  return stats;
}