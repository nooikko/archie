import type { Game } from '@/lib/search';
import { GameCard } from './game-card';
import { StatusLegend } from './status-legend';

interface GameGridProps {
  games: readonly Game[];
}

export const GameGrid = ({ games }: GameGridProps) => {
  if (games.length === 0) {
    return (
      <div className='flex items-center justify-center py-20'>
        <div className='text-center space-y-3 max-w-md'>
          <div className='inline-flex items-center justify-center w-16 h-16 border-2 border-border bg-muted'>
            <span className='text-2xl'>🎮</span>
          </div>
          <p className='font-semibold text-lg text-foreground'>No games found</p>
          <p className='font-mono text-[12px] text-muted-foreground uppercase tracking-wide'>Try adjusting your search criteria</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-0'>
      {/* Header */}
      <div className='sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b-2 border-border'>
        <div className='grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_120px_100px] lg:grid-cols-[1fr_140px_100px_120px] gap-2 sm:gap-4 lg:gap-6 px-2 sm:px-6 py-3'>
          <div className='flex items-center gap-3'>
            <span className='font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground'>Game Title</span>
            <span className='font-mono text-[11px] font-medium text-muted-foreground/50'>({games.length})</span>
          </div>
          <div className='flex items-center gap-1.5 justify-end sm:justify-start'>
            <span className='font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground'>Status</span>
            <StatusLegend />
          </div>
          <span className='hidden sm:block font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground'>Platform</span>
          <span className='hidden lg:block font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground'>Emulator</span>
        </div>
      </div>

      {/* Game list */}
      <ul className='list-none'>
        {games.map((game, index) => (
          <GameCard key={game.Game} game={game} index={index} />
        ))}
      </ul>
    </div>
  );
};
