"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayerPanel } from '@/components/PlayerPanel';
import { useGameStore } from '@/state/useGameStore';
import { checkCodeDigit, hasGuessedAllDigits } from '@/utils/gameLogic';
import { ArrowLeftIcon, TrophyIcon, LockIcon, HashIcon } from 'lucide-react';
import Link from 'next/link';

export default function CodeFall() {
  const router = useRouter();
  const {
    players,
    currentPlayerIndex,
    codeDigits,
    guessedDigits,
    gameOver,
    initializeCodeDigits,
    guessDigit,
    updatePlayerScore,
    nextPlayer,
    setGameOver,
    resetGame,
    setCurrentPlayer
  } = useGameStore();
  
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [selectedDigit, setSelectedDigit] = useState<number | null>(null);
  const [revealedPositions, setRevealedPositions] = useState<number[]>([]);
  const [message, setMessage] = useState<string>('');
  
  // Initialize game
  useEffect(() => {
    if (players.length < 2) {
      router.push('/lobby?game=code-fall');
      return;
    }
    
    if (!codeDigits || codeDigits.length === 0) {
      initializeCodeDigits();
      setCurrentPlayer(0);
    }
  }, [players.length, codeDigits, initializeCodeDigits, router, setCurrentPlayer]);
  
  const currentPlayer = players[currentPlayerIndex];
  
  // Handle position selection
  const handleSelectPosition = (position: number) => {
    if (revealedPositions.includes(position)) return;
    setSelectedPosition(position);
    setSelectedDigit(null);
  };
  
  // Handle digit selection
  const handleSelectDigit = (digit: number) => {
    setSelectedDigit(digit);
  };
  
  // Handle making a guess
  const handleMakeGuess = () => {
    if (selectedPosition === null || selectedDigit === null || !codeDigits) return;
    
    const isCorrect = checkCodeDigit(codeDigits, selectedPosition, selectedDigit);
    
    if (isCorrect) {
      // Mark position as revealed
      setRevealedPositions(prev => [...prev, selectedPosition]);
      
      // Update guessed digit
      guessDigit(selectedPosition, selectedDigit);
      
      // Add points
      updatePlayerScore(currentPlayer.id, currentPlayer.score + 3);
      
      setMessage(`Correct! ${currentPlayer.name} found digit ${selectedDigit}`);
      
      // Check if all digits are guessed
      if ((revealedPositions.length + 1) >= 3) {
        setGameOver(true);
      }
    } else {
      setMessage(`Wrong guess! ${currentPlayer.name}'s turn is over.`);
      nextPlayer();
    }
    
    // Reset selection
    setSelectedPosition(null);
    setSelectedDigit(null);
  };
  
  // Return to lobby and reset game
  const handleReturnToLobby = () => {
    resetGame();
    router.push('/lobby');
  };
  
  // Get revealed code display
  const getCodeDisplay = () => {
    if (!guessedDigits) return ['?', '?', '?'];
    
    return guessedDigits.map((digit, index) => {
      if (digit === -1) return '?';
      return digit.toString();
    });
  };
  
  const codeDisplay = getCodeDisplay();
  
  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/lobby">
            <Button variant="outline" size="icon">
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Code Fall</h1>
          <div className="w-10" />
        </div>
        
        {/* Game Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              {!gameOver ? "Crack the Code" : "Code Cracked!"}
            </CardTitle>
            <CardDescription>
              {!gameOver 
                ? "Flip tiles to find the 3-digit code" 
                : "The code has been fully revealed"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center gap-4 mb-6">
              {codeDisplay.map((digit, index) => (
                <div 
                  key={index}
                  className="w-14 h-14 flex items-center justify-center text-2xl font-bold border-2 rounded-md"
                >
                  {digit}
                </div>
              ))}
            </div>
            
            {message && (
              <div className="p-3 bg-secondary rounded-md text-center">
                {message}
              </div>
            )}
          </CardContent>
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
                {players.sort((a, b) => b.score - a.score)[0].name} cracked the code!
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-0">
              <div className="flex justify-center gap-4 mb-6">
                {codeDigits?.map((digit, index) => (
                  <div 
                    key={index}
                    className="w-14 h-14 flex items-center justify-center text-2xl font-bold bg-primary text-primary-foreground rounded-md"
                  >
                    {digit}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-6">
              <Button onClick={handleReturnToLobby} className="w-full">
                Return to Lobby
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {/* Current Player */}
        {!gameOver && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Current Turn</CardTitle>
            </CardHeader>
            <CardContent>
              <PlayerPanel 
                player={currentPlayer}
                onRemove={() => {}}
                showScore
              />
            </CardContent>
          </Card>
        )}
        
        {/* Grid */}
        {!gameOver && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LockIcon className="h-5 w-5" />
                Code Grid
              </CardTitle>
              <CardDescription>
                Select a position to guess the digit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3 mb-6">
                {Array.from({ length: 16 }).map((_, index) => {
                  const row = Math.floor(index / 4);
                  const col = index % 4;
                  const position = row === 0 ? col : -1; // Only first row has positions
                  
                  return (
                    <button
                      key={index}
                      className={`
                        aspect-square flex items-center justify-center rounded-md border-2 transition-all
                        ${selectedPosition === position ? 'border-primary' : 'border-border'}
                        ${position === -1 || revealedPositions.includes(position)
                          ? 'bg-muted cursor-default'
                          : 'bg-card hover:border-primary/50 cursor-pointer'}
                      `}
                      onClick={() => position !== -1 && !revealedPositions.includes(position) && handleSelectPosition(position)}
                      disabled={position === -1 || revealedPositions.includes(position)}
                    >
                      {position !== -1 && revealedPositions.includes(position) ? (
                        <span className="text-xl font-bold">{guessedDigits?.[position]}</span>
                      ) : (
                        <HashIcon className="h-6 w-6 text-muted-foreground" />
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Digit Selection */}
        {!gameOver && selectedPosition !== null && (
          <Card className="mb-8 border-primary">
            <CardHeader>
              <CardTitle>Select a Digit</CardTitle>
              <CardDescription>
                Choose which digit you think is in position {selectedPosition + 1}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-3">
                {Array.from({ length: 10 }).map((_, digit) => (
                  <button
                    key={digit}
                    className={`
                      aspect-square flex items-center justify-center text-xl font-bold rounded-md border-2 transition-all
                      ${selectedDigit === digit ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:border-primary/50'}
                    `}
                    onClick={() => handleSelectDigit(digit)}
                  >
                    {digit}
                  </button>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleMakeGuess}
                disabled={selectedDigit === null}
                className="w-full"
              >
                Confirm Guess
              </Button>
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