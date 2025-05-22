"use client"

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayerPanel } from '@/components/PlayerPanel';
import { useGameStore } from '@/state/useGameStore';
import { calculatePulseAccuracy } from '@/utils/gameLogic';
import { ArrowLeftIcon, TrophyIcon, ActivityIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

export default function PulseDrop() {
  const router = useRouter();
  const {
    players,
    beatTempo,
    gameOver,
    setBeatTempo,
    updatePlayerScore,
    setGameOver,
    resetGame
  } = useGameStore();
  
  const [gameTime, setGameTime] = useState(60); // 60 seconds game duration
  const [isRunning, setIsRunning] = useState(false);
  const [beatPhase, setBeatPhase] = useState(0); // 0-100 for animation
  const [lastBeatTime, setLastBeatTime] = useState(0);
  const [playerCombos, setPlayerCombos] = useState<Record<string, number>>({});
  const [playerLastTap, setPlayerLastTap] = useState<Record<string, number>>({});
  const [gameStarted, setGameStarted] = useState(false);
  const [winningStreak, setWinningStreak] = useState(10); // Streak needed to win
  
  // Initialize player combos
  useEffect(() => {
    if (players.length < 2) {
      router.push('/lobby?game=pulse-drop');
      return;
    }
    
    const initialCombos: Record<string, number> = {};
    players.forEach(player => {
      initialCombos[player.id] = 0;
    });
    setPlayerCombos(initialCombos);
  }, [players, router]);
  
  // Beat animation and timing
  useEffect(() => {
    if (!isRunning) return;
    
    let animationFrame: number;
    let lastTimestamp = performance.now();
    let progress = 0;
    
    const animate = (timestamp: number) => {
      const elapsed = timestamp - lastTimestamp;
      progress = (progress + (elapsed / beatTempo) * 100) % 100;
      
      // Detect beat
      if (progress < (elapsed / beatTempo) * 100) {
        setLastBeatTime(timestamp);
      }
      
      setBeatPhase(progress);
      lastTimestamp = timestamp;
      animationFrame = requestAnimationFrame(animate);
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [isRunning, beatTempo]);
  
  // Change tempo every 10 seconds
  useEffect(() => {
    if (!isRunning) return;
    
    const tempoInterval = setInterval(() => {
      // Random tempo between 600ms and 1200ms
      const newTempo = Math.floor(Math.random() * 600) + 600;
      setBeatTempo(newTempo);
    }, 10000);
    
    return () => clearInterval(tempoInterval);
  }, [isRunning, setBeatTempo]);
  
  // Game timer
  useEffect(() => {
    if (!isRunning) return;
    
    const timer = setInterval(() => {
      setGameTime(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          setGameOver(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isRunning, setGameOver]);
  
  // Handle player tap
  const handlePlayerTap = useCallback((playerId: string) => {
    if (!isRunning) return;
    
    const now = performance.now();
    const accuracy = calculatePulseAccuracy(lastBeatTime, now, beatTempo / 2);
    
    setPlayerLastTap(prev => ({ ...prev, [playerId]: now }));
    
    // Update combo
    if (accuracy > 0) {
      setPlayerCombos(prev => {
        const newCombo = (prev[playerId] || 0) + 1;
        return { ...prev, [playerId]: newCombo };
      });
      
      // Add points based on accuracy
      const points = Math.floor(accuracy * 10);
      updatePlayerScore(playerId, players.find(p => p.id === playerId)?.score + points);
      
      // Check win by streak
      const newCombo = (playerCombos[playerId] || 0) + 1;
      if (newCombo >= winningStreak) {
        setIsRunning(false);
        setGameOver(true);
      }
    } else {
      // Break combo
      setPlayerCombos(prev => ({ ...prev, [playerId]: 0 }));
    }
  }, [isRunning, lastBeatTime, beatTempo, playerCombos, players, updatePlayerScore, winningStreak]);
  
  // Start game
  const handleStartGame = () => {
    setIsRunning(true);
    setGameStarted(true);
    setGameTime(60);
    setGameOver(false);
    
    // Reset scores
    players.forEach(player => {
      updatePlayerScore(player.id, 0);
    });
    
    // Initial tempo
    setBeatTempo(1000);
  };
  
  // Return to lobby
  const handleReturnToLobby = () => {
    resetGame();
    router.push('/lobby');
  };
  
  // Get the beat color based on phase
  const getBeatColor = () => {
    if (beatPhase > 90 || beatPhase < 10) return 'bg-emerald-500';
    if (beatPhase > 80 || beatPhase < 20) return 'bg-amber-500';
    return 'bg-muted';
  };
  
  // Get the winner
  const getWinner = () => {
    if (!gameOver) return null;
    return [...players].sort((a, b) => b.score - a.score)[0];
  };
  
  const winner = getWinner();
  
  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/lobby">
            <Button variant="outline" size="icon">
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Pulse Drop</h1>
          <div className="w-10" />
        </div>
        
        {/* Game Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{isRunning ? "Tap in sync with the beat!" : "Ready to play?"}</span>
              {isRunning && (
                <span className="text-xl">{gameTime}s</span>
              )}
            </CardTitle>
            <CardDescription>
              {isRunning 
                ? `Current tempo: ${Math.round(60000 / beatTempo)} BPM` 
                : "Tap when the pulse hits the center to build your combo"}
            </CardDescription>
          </CardHeader>
          {!gameStarted && !gameOver && (
            <CardFooter>
              <Button onClick={handleStartGame} className="w-full py-8 text-lg">
                Start Game
              </Button>
            </CardFooter>
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
                {winner ? `${winner.name} wins with ${winner.score} points!` : 'Everyone lost!'}
              </CardDescription>
            </CardHeader>
            <CardFooter className="pt-6 flex flex-col gap-3">
              <Button onClick={handleStartGame} className="w-full">
                Play Again
              </Button>
              <Button onClick={handleReturnToLobby} variant="outline" className="w-full">
                Return to Lobby
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {/* Beat Visualization */}
        {(isRunning || gameStarted) && (
          <Card className="mb-8 overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ActivityIcon className="h-5 w-5" />
                Beat Pulse
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-8">
              <div className="relative h-12 mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="h-1 w-full bg-muted rounded-full" />
                </div>
                <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-center">
                  <div className="h-10 w-10 rounded-full border-2 border-primary" />
                </div>
                <div 
                  className="absolute inset-y-0 flex items-center justify-center"
                  style={{ 
                    left: `${beatPhase}%`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  <div className={`h-6 w-6 rounded-full ${getBeatColor()} transition-colors shadow-md`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Player Controls */}
        {(isRunning || gameStarted) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {players.map(player => (
              <Card key={player.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{player.name}</CardTitle>
                  <CardDescription>
                    Combo: {playerCombos[player.id] || 0} | Score: {player.score}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <Progress 
                    value={(playerCombos[player.id] || 0) / winningStreak * 100} 
                    className="h-2 mb-4"
                  />
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => handlePlayerTap(player.id)}
                    disabled={!isRunning}
                    className="w-full py-8 text-lg"
                  >
                    TAP
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
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