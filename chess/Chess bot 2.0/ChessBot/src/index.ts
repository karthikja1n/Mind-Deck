// Main entry point for the chess bot module
export { getBestMove } from './chess-bot.js';
export * from './types.js';

// Export new features
export { getEvaluationBar, getEvaluationChange } from './evaluation-bar.js';
export { checkBlunder, analyzeGameForBlunders, getBlunderStats } from './blunder-detection.js';
export { 
  recognizeOpening, 
  getPossibleOpenings, 
  startFromOpening, 
  getOpeningByEco, 
  getAllOpenings, 
  analyzeOpeningFromGame,
  getNextOpeningMove,
  type ChessOpening 
} from './openings.js';