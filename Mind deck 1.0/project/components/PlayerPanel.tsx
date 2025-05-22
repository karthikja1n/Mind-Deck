import { Button } from "@/components/ui/button";
import { Player } from "@/state/useGameStore";
import { UserIcon, XIcon } from "lucide-react";

interface PlayerPanelProps {
  player: Player;
  onRemove: () => void;
  showScore?: boolean;
}

export function PlayerPanel({ player, onRemove, showScore = false }: PlayerPanelProps) {
  return (
    <div className={`
      flex items-center justify-between p-3 rounded-md
      ${player.isActive 
        ? 'bg-secondary' 
        : 'bg-secondary/50 text-muted-foreground'}
      ${player.isCurrentPlayer ? 'ring-2 ring-primary' : ''}
    `}>
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
          <UserIcon className="h-4 w-4 text-primary" />
        </div>
        <span className="font-medium">{player.name}</span>
        {showScore && (
          <span className="ml-2 px-2 py-0.5 bg-background rounded text-sm">
            {player.score} pts
          </span>
        )}
      </div>
      {onRemove && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onRemove} 
          className="h-7 w-7"
        >
          <XIcon className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}