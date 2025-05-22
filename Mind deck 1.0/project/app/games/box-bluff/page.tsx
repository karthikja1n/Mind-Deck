"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayerPanel } from '@/components/PlayerPanel';
import { useGameStore } from '@/state/useGameStore';
import { checkBoxGuess } from '@/utils/gameLogic';
import { ArrowLeftIcon, TrophyIcon, BoxIcon, HelpCircleIcon, ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import Link from 'next/link';

export default function BoxBluff() {
  const router = useRouter();
  const {
    players,
    currentPlayerIndex,
    boxNumbers,
    revealedBoxes,
    gameOver,
    initializeBoxNumbers,
    revealBox,
    updatePlayerScore,
    nextPlayer,
    setGameOver,
    resetGame,
    setCurrentPlayer
  } = useGameStore();

  const [selectedBox, setSelectedBox] = useState<number | null>(null);
  const [guessDirection, setGuessDirection] = useState<'higher' | 'lower' | null>(null);
  const [lastResult, setLastResult] = useState<{
    player: string;
    box: number;
    number: number;
    guess: string;
    correct: boolean;
  } | null>(null);
  
  // Initialize game
  useEffect(() => {
    if (players.length < 2) {
      router.push('/lobby?game=box-bluff');
      return;
    }
    
    if (!boxNumbers || boxNumbers.length === 0) {
      initializeBoxNumbers();
      setCurrentPlayer(0);
    }
  }, [players.length, boxNumbers, initializeBoxNumbers, router, setCurrentPlayer]);
  
  const currentPlayer = players[currentPlayerIndex];
  
  // Handle box selection
  const handleSelectBox = (boxIndex: number) => {
    if (revealedBoxes?.includes(boxIndex)) return;
    setSelectedBox(boxIndex);
    setGuessDirection(null);
  };
  
  // Handle direction guess
  const handleGuessDirection = (direction: 'higher' | 'lower') => {
    setGuessDirection(direction);
  };
  
  // Handle making a guess
  const handleMakeGuess = () => {
    if (selectedBox === null || !guessDirection || !boxNumbers) return;
    
    const boxValue = boxNumbers[selectedBox];
    const isCorrect = checkBoxGuess(boxValue, guessDirection);
    
    // Update player score
    const newScore = currentPlayer.score + (isCorrect ? 2 : -1);
    updatePlayerScore(currentPlayer.id, Math.max(0, newScore));
    
    // Save result for display
    setLastResult({
      player: currentPlayer.name,
      box: selectedBox + 1,
      number: boxValue,
      guess: guessDirection === 'higher' ? 'Higher than 50' : 'Lower than 50',
      correct: isCorrect
    });
    
    // Reveal the box
    revealBox(selectedBox);
    
    // Check win condition - player has unlocked 3 boxes
    const playerRevealedBoxes = isCorrect ? 
      (revealedBoxes?.filter(b => players[currentPlayerIndex]?.id) || []).length + 1 : 
      (revealedBoxes?.filter(b => players[currentPlayerIndex]?.id) || []).length;
    
    if (playerRevealedBoxes >= 3) {
      setGameOver(true);
    } else {
      // Move to next player
      nextPlayer();
    }
    
    // Reset selection
    setSelectedBox(null);
    setGuessDirection(null);
  };
  
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
          <h1 className="text-3xl font-bold">Box Bluff</h1>
          <div className="w-10" />
        </div>
        
        {/* Game Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              {!gameOver ? "Current Turn" : "Game Over"}
            </CardTitle>
            <CardDescription>
              {!gameOver 
                ? "Pick a box and guess if the number is higher or lower than 50" 
                : "One player has successfully unlocked 3 boxes"}
            </CardDescription>
          </CardHeader>
          {!gameOver && (
            <CardContent>
              <PlayerPanel 
                player={currentPlayer}
                onRemove={() => {}}
                showScore
              />
            </CardContent>
          )}
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
                {players.sort((a, b) => b.score - a.score)[0].name} wins!
              </CardDescription>
            </CardHeader>
            <CardFooter className="pt-6">
              <Button onClick={handleReturnToLobby} className="w-full">
                Return to Lobby
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {/* Box Grid */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Mystery Boxes</CardTitle>
            <CardDescription>
              Each box contains a number between 1-100
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <button
                  key={index}
                  className={`
                    aspect-square flex flex-col items-center justify-center rounded-lg border-2 transition-all
                    ${selectedBox === index ? 'border-primary' : 'border-border'}
                    ${revealedBoxes?.includes(index) 
                      ? 'bg-muted cursor-default' 
                      : 'bg-card hover:border-primary/50 cursor-pointer'}
                  `}
                  onClick={() => !revealedBoxes?.includes(index) && !gameOver && handleSelectBox(index)}
                  disabled={revealedBoxes?.includes(index) || gameOver}
                >
                  {revealedBoxes?.includes(index) ? (
                    <div className="text-center">
                      <div className="text-3xl font-bold">{boxNumbers?.[index]}</div>
                      <div className="text-sm text-muted-foreground mt-2">
                        {boxNumbers?.[index] > 50 ? 'Higher' : 'Lower'}
                      </div>
                    </div>
                  ) : (
                    <>
                      <BoxIcon className="h-12 w-12 mb-2 text-muted-foreground" />
                      <span className="text-lg font-medium">Box {index + 1}</span>
                    </>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Guess Controls */}
        {!gameOver && selectedBox !== null && (
          <Card className="mb-8 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircleIcon className="h-5 w-5" />
                Make Your Guess
              </CardTitle>
              <CardDescription>
                Is the number in Box {selectedBox + 1} higher or lower than 50?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button
                  variant={guessDirection === 'higher' ? 'default' : 'outline'}
                  className="flex-1 py-8"
                  onClick={() => handleGuessDirection('higher')}
                >
                  <ArrowUpIcon className="h-6 w-6 mr-2" />
                  Higher than 50
                </Button>
                <Button
                  variant={guessDirection === 'lower' ? 'default' : 'outline'}
                  className="flex-1 py-8"
                  onClick={() => handleGuessDirection('lower')}
                >
                  <ArrowDownIcon className="h-6 w-6 mr-2" />
                  Lower than 50
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleMakeGuess} 
                disabled={!guessDirection}
                className="w-full"
              >
                Confirm Guess
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {/* Last Result */}
        {lastResult && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Last Result</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div><strong>Player:</strong> {lastResult.player}</div>
                <div><strong>Box:</strong> {lastResult.box}</div>
                <div><strong>Number:</strong> {lastResult.number}</div>
                <div><strong>Guess:</strong> {lastResult.guess}</div>
                <div className={lastResult.correct ? 'text-green-500' : 'text-red-500'}>
                  <strong>Result:</strong> {lastResult.correct ? 'Correct! (+2 points)' : 'Wrong! (-1 point)'}
                </div>
              </div>
            </CardContent>
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