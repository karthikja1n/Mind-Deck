import { GameCard } from '@/components/GameCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MapIcon as MindMapIcon } from 'lucide-react';

export default function Home() {
  const games = [
    {
      id: 'zeroed-out',
      title: 'Zeroed Out',
      description: 'Pick numbers strategically to get closest to the target.',
      players: '2-10 players',
      type: 'Round-based',
      color: 'bg-gradient-to-br from-indigo-500 to-purple-600',
    },
    {
      id: 'box-bluff',
      title: 'Box Bluff',
      description: 'Guess if hidden numbers are higher or lower than 50.',
      players: '2-6 players',
      type: 'Turn-based',
      color: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    },
    {
      id: 'pulse-drop',
      title: 'Pulse Drop',
      description: 'Tap in sync with the beat to earn points and combos.',
      players: '2-8 players',
      type: 'Real-time',
      color: 'bg-gradient-to-br from-amber-500 to-orange-600',
    },
    {
      id: 'code-fall',
      title: 'Code Fall',
      description: 'Flip tiles and guess the hidden code digits.',
      players: '2-4 players',
      type: 'Turn-based',
      color: 'bg-gradient-to-br from-blue-500 to-cyan-600',
    },
  ];

  return (
    <main className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col items-center mb-12">
          <div className="flex items-center gap-3 mb-4">
            <MindMapIcon className="h-10 w-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Mind Deck</h1>
          </div>
          <p className="text-xl text-muted-foreground text-center max-w-2xl">
            Challenge your friends with four quick-play strategy games that test your wits and decision-making.
          </p>
        </header>

        <div className="flex justify-center mb-8">
          <Link href="/lobby">
            <Button size="lg" className="text-lg px-8 py-6">
              Start Playing
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {games.map((game) => (
            <GameCard
              key={game.id}
              title={game.title}
              description={game.description}
              players={game.players}
              type={game.type}
              color={game.color}
              href={`/lobby?game=${game.id}`}
            />
          ))}
        </div>

        <footer className="text-center text-muted-foreground mt-16">
          <p>© 2025 Mind Deck. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}