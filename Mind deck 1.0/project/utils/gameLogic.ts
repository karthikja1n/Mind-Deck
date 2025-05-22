/**
 * Calculates the target number for Zeroed Out game
 * Target = Average of all numbers / 0.8
 */
export function calculateTarget(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  const average = sum / numbers.length;
  return Math.round(average / 0.8);
}

/**
 * Determines the winner for Zeroed Out round
 * Returns an object with the winner ID and difference from target
 */
export function findClosestToTarget(
  guesses: Record<string, number>, 
  target: number
): { winnerId: string | null, difference: number } {
  let minDifference = Infinity;
  let winnerId: string | null = null;
  
  Object.entries(guesses).forEach(([playerId, guess]) => {
    const difference = Math.abs(guess - target);
    
    if (difference < minDifference) {
      minDifference = difference;
      winnerId = playerId;
    }
  });
  
  return { winnerId, difference: minDifference };
}

/**
 * Updates player scores for Zeroed Out round
 */
export function updateZeroedOutScores(
  players: Array<{ id: string; score: number }>,
  guesses: Record<string, number>,
  target: number
): Array<{ id: string; score: number; isActive: boolean }> {
  const { winnerId, difference } = findClosestToTarget(guesses, target);
  
  return players.map(player => {
    let newScore = player.score;
    
    // Exact match bonus - others lose 2 points
    if (winnerId === player.id && difference === 0) {
      // Winner gets no additional points for exact match
      newScore = player.score;
    } 
    // Exact match penalty for others
    else if (winnerId !== player.id && difference === 0) {
      newScore = player.score - 2;
    }
    // Winner
    else if (winnerId === player.id) {
      // No score change for winner
      newScore = player.score;
    } 
    // Not closest
    else {
      newScore = player.score - 1;
    }
    
    // Check if player is eliminated
    const isActive = newScore > 0;
    
    return {
      id: player.id,
      score: Math.max(0, newScore),
      isActive
    };
  });
}

/**
 * Checks if a box guess is correct for Box Bluff
 */
export function checkBoxGuess(
  boxNumber: number, 
  guess: 'higher' | 'lower'
): boolean {
  if (guess === 'higher') {
    return boxNumber > 50;
  } else {
    return boxNumber <= 50;
  }
}

/**
 * Calculates accuracy of pulse beat timing
 * Returns a score between 0-1
 */
export function calculatePulseAccuracy(
  beatTime: number, 
  playerTapTime: number,
  tolerance: number = 200
): number {
  const difference = Math.abs(beatTime - playerTapTime);
  
  // Perfect timing
  if (difference < 50) return 1.0;
  
  // Good timing
  if (difference < 100) return 0.8;
  
  // Okay timing
  if (difference < tolerance) return 0.5;
  
  // Missed beat
  return 0;
}

/**
 * Checks if the guessed code digit is correct
 */
export function checkCodeDigit(
  codeDigits: number[], 
  position: number, 
  guess: number
): boolean {
  return codeDigits[position] === guess;
}

/**
 * Checks if all code digits have been guessed correctly
 */
export function hasGuessedAllDigits(
  codeDigits: number[], 
  guessedDigits: number[]
): boolean {
  return codeDigits.every((digit, index) => digit === guessedDigits[index]);
}