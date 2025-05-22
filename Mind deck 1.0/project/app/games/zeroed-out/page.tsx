"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayerPanel } from '@/components/PlayerPanel';
import { Timer } from '@/components/Timer';
import { useGameStore } from '@/state/useGameStore';
import { calculateTarget, updateZeroedOutScores } from '@/utils/gameLogic';
import { ArrowLeftIcon, TrophyIcon, TargetIcon } from 'lucide-react';
import Link from 'next/link';

export default function ZeroedOut() {
  const router = useRouter();
  const { 
    players, 
    currentRound, 
    maxRounds,
    playerGuesses, 
    targetNumber,
    gameOver,
    submitPlayerGuess,
    clearPlayerGuesses,
    setTargetNumber,
    startNewRound,
    updatePlayerScore,
    setPlayerActive,
    setGameOver,
    resetGame
  } = useGameStore();
  
  const [guess, setGuess] = useState<string>('');
  const [playerId, setPlayerId] = useState<string>('');
  const [roundPhase, setRoundPhase] = useState<'guessing' | 'results'>('guessing');
  const [roundTimer, setRoundTimer] = useState<number>(30); // seconds
  const [showingResults, setShowingResults] = useState<boolean>(false);
  
  // Initialize if no players
  useEffect(() => {
    if (players.length < 2) {
      router.push('/lobby?game=zeroed-out');
    }
  }, [players.length, router]);
  
  // Handle end of round timer
  const handleTimerComplete = () => {
    if (roundPhase === 'guessing') {
      processRoundResults();
    }
  };
  
  // Process guesses and determine round results
  const processRoundResults = () => {
    const guessValues = Object.values(playerGuesses);
    
    if (guessValues.length > 0) {
      // Calculate target number
      const target = calculateTarget(guessValues);
      setTargetNumber(target);
      
      // Update player scores
      const updatedPlayers = updateZeroedOutScores(players, playerGuesses, target);
      
      // Update state with new scores and active status
      updatedPlayers.forEach(p => {
        updatePlayerScore(p.id, p.score);
        setPlayerActive(p.id, p.isActive);
      });
      
      // Check game over conditions
      const activePlayers = updatedPlayers.filter(p => p.isActive);
      
      if (activePlayers.length <= 1 || currentRound >= maxRounds) {
        setGameOver(true);
      }
    }
    
    setRoundPhase('results');
    setShowingResults(true);
  };
  
  // Handle player guess submission
  const handleSubmitGuess = () => {
    if (playerId && guess && !playerGuesses[playerId]) {
      const guessNum = Math.min(100, Math.max(1, parseInt(guess)));
      submitPlayerGuess(playerId, guessNum);
      setGuess('');
      setPlayerId('');
    }
  };
  
  // Handle starting the next round
  const handleNextRound = () => {
    clearPlayerGuesses();
    startNewRound();
    setRoundPhase('guessing');
    setShowingResults(false);
  };
  
  // Find the winner of the game
  const getWinner = () => {
    if (!gameOver) return null;
    return [...players].sort((a, b) => b.score - a.score)[0];
  };
  
  const winner = getWinner();
  const activePlayerCount = players.filter(p => p.isActive).length;
  
  // Return to lobby and reset game
  const handleReturnToLobby = () => {
    resetGame();
    router.push('/lobby');
  };
  
  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/lobby">
            <Button variant="outline" size="icon">
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Zeroed Out</h1>
          <div className="w-10" />
        </div>
        
        {/* Game Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Round {currentRound}/{maxRounds}</span>
              {roundPhase === 'guessing' && (
                <Timer 
                  duration={roundTimer} 
                  onComplete={handleTimerComplete} 
                  className="w-48"
                />
              )}
            </CardTitle>
            <CardDescription>
              {roundPhase === 'guessing' 
                ? 'Choose a number between 1-100. The target will be the average of all numbers ÷ 0.8' 
                : `Target number: ${targetNumber}`}
            </CardDescription>
          </CardHeader>
        </Card>
        
        {/* Game Over */}
        {gameOver && (
          <Card className="mb-8 border-primary">
            <CardHeader className="bg-primary/10">
              <CardTitle className="flex items-center gap-2">
                <TrophyIcon className="h-6 w-6 text-primary" />
                Game Over
              </CardTitle>
              <CardDescription>
                {winner ? `${winner.name} wins with ${winner.score} points!` : 'Everyone lost!'}
              </CardDescription>
            </CardHeader>
            <CardFooter className="pt-6">
              <Button onClick={handleReturnToLobby} className="w-full">
                Return to Lobby
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {/* Guessing Phase */}
        {!gameOver && roundPhase === 'guessing' && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Make Your Guess</CardTitle>
              <CardDescription>
                Pick a number between 1-100
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Player</label>
                  <div className="space-y-2">
                    {players.filter(p => p.isActive && !playerGuesses[p.id]).map(player => (
                      <button
                        key={player.id}
                        className={`w-full text-left p-2 rounded-md transition-colors ${
                          playerId === player.id 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-secondary hover:bg-secondary/80'
                        }`}
                        onClick={() => setPlayerId(player.id)}
                      >
                        {player.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Your Number (1-100)</label>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={guess}
                      onChange={(e) => setGuess(e.target.value)}
                      placeholder="Enter number"
                      disabled={!playerId}
                    />
                    <Button 
                      onClick={handleSubmitGuess}
                      disabled={!playerId || !guess || parseInt(guess) < 1 || parseInt(guess) > 100}
                    >
                      Submit
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <div className="text-sm font-medium mb-2">Guesses Submitted:</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 w-full">
                {players
                  .filter(p => playerGuesses[p.id])
                  .map(player => (
                    <div key={player.id} className="bg-secondary p-2 rounded text-sm text-center">
                      {player.name}
                    </div>
                  ))
                }
              </div>
              
              {Object.keys(playerGuesses).length > 0 && Object.keys(playerGuesses).length === activePlayerCount && (
                <Button 
                  onClick={processRoundResults} 
                  className="mt-4 w-full"
                >
                  Everyone has guessed - Show Results
                </Button>
              )}
            </CardFooter>
          </Card>
        )}
        
        {/* Results Phase */}
        {!gameOver && roundPhase === 'results' && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TargetIcon className="h-5 w-5" />
                Round Results
              </CardTitle>
              <CardDescription>
                Target number: {targetNumber}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {players.map(player => (
                  <div key={player.id} className="flex items-center justify-between p-3 bg-secondary rounded-md">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{player.name}</span>
                      <span className="text-muted-foreground">
                        Guessed: {playerGuesses[player.id] || 'No guess'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded ${player.isActive ? 'bg-primary/20' : 'bg-destructive/20'}`}>
                        {player.score} pts
                      </span>
                      {!player.isActive && (
                        <span className="text-destructive text-sm font-medium">Eliminated</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              {!gameOver && (
                <Button onClick={handleNextRound} className="w-full">
                  Next Round
                </Button>
              )}
            </CardFooter>
          </Card>
        )}
        
        {/* Player Scores */}
        <Card>
          <CardHeader>
            <CardTitle>Player Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {players
                .sort((a, b) => b.score - a.score)
                .map(player => (
                  <PlayerPanel 
                    key={player.id} 
                    player={player}
                    onRemove={() => {}}
                    showScore
                  />
                ))
              }
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}