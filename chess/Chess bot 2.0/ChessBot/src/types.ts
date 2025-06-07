export type Difficulty = 'easy' | 'medium' | 'hard';

export interface EvaluationConfig {
  maxDepth: number;
  useOpeningBook: boolean;
  useEndgameEval: boolean;
  randomFactor: number;
}

export interface PieceSquareTable {
  [key: string]: number[][];
}

export interface MoveEvaluation {
  move: string;
  score: number;
  depth: number;
}