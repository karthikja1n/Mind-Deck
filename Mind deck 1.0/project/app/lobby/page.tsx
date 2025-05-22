"use client"

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlayerPanel } from '@/components/PlayerPanel';
import { useGameStore } from '@/state/useGameStore';
import { ArrowLeftIcon, UsersIcon, PlayIcon } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Lobby() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedGameId = searchParams.get('game') || 'zeroed-out';
  
  const { players, addPlayer, removePlayer, setCurrentGame, resetGame } = useGameStore();
  const [playerName, setPlayerName] = useState('');

  useEffect(() => {
    // Reset game state when entering lobby
    resetGame();
    setCurrentGame(selectedGameId);
  }, [resetGame, selectedGameId, setCurrentGame]);

  const handleAddPlayer = () => {
    if (playerName.trim() && players.length < 10) {
      addPlayer({ id: Date.now().toString(), name: playerName.trim(), score: 10, isActive: true });
      setPlayerName('');
    }
  };

  const handleStartGame = () => {
    if (players.length >= 2) {
      router.push(`/games/${selectedGameId}`);
    }
  };

  const games = [
    { id: 'zeroed-out', title: 'Zeroed Out', minPlayers: 2, maxPlayers: 10 },
    { id: 'box-bluff', title: 'Box Bluff', minPlayers: 2, maxPlayers: 6 },
    { id: 'pulse-drop', title: 'Pulse Drop', minPlayers: 2, maxPlayers: 8 },
    { id: 'code-fall', title: 'Code Fall', minPlayers: 2, maxPlayers: 4 },
  ];

  const selectedGame = games.find(game => game.id === selectedGameId) || games[0];

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="outline" size="icon">
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Game Lobby</h1>
          <div className="w-10" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Game Setup</CardTitle>
              <CardDescription>
                Select a game and add players to start
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Selected Game</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {games.map((game) => (
                      <Link 
                        href={`/lobby?game=${game.id}`} 
                        key={game.id}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          game.id === selectedGameId 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-secondary hover:bg-secondary/80'
                        }`}
                      >
                        {game.title}
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Add Players ({players.length}/{selectedGame.maxPlayers})</h3>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter player name"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                      disabled={players.length >= selectedGame.maxPlayers}
                    />
                    <Button onClick={handleAddPlayer} disabled={players.length >= selectedGame.maxPlayers}>
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UsersIcon className="h-5 w-5" />
                Players ({players.length})
              </CardTitle>
              <CardDescription>
                {selectedGame.minPlayers - players.length > 0
                  ? `Add ${selectedGame.minPlayers - players.length} more player(s) to start`
                  : 'Ready to start the game'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {players.length > 0 ? (
                <div className="space-y-2">
                  {players.map((player) => (
                    <PlayerPanel 
                      key={player.id} 
                      player={player} 
                      onRemove={() => removePlayer(player.id)} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No players added yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center">
          <Button 
            size="lg" 
            onClick={handleStartGame}
            disabled={players.length < selectedGame.minPlayers}
            className="px-8"
          >
            <PlayIcon className="mr-2 h-5 w-5" />
            Start Game
          </Button>
        </div>
      </div>
    </div>
  );
}