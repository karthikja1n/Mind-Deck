import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserIcon, ClockIcon } from 'lucide-react';
import Link from 'next/link';

interface GameCardProps {
  title: string;
  description: string;
  players: string;
  type: string;
  color: string;
  href: string;
}

export function GameCard({ title, description, players, type, color, href }: GameCardProps) {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg group">
      <div className={`${color} h-3 transition-all duration-300 group-hover:h-4`} />
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <UserIcon className="h-4 w-4" />
            <span>{players}</span>
          </div>
          <div className="flex items-center gap-1">
            <ClockIcon className="h-4 w-4" />
            <span>{type}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={href} className="w-full">
          <Button variant="outline" className="w-full">
            Play Now
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}