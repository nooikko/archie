import { memo } from 'react';
import type { Game } from '@/lib/search';
import { StatusBadgeTooltip } from '../status-badge-tooltip';

interface GameCardProps {
  game: Game;
  index: number;
}

const getStatusColors = (status: string) => {
  switch (status) {
    case 'Stable':
      return {
        bg: 'var(--status-stable-bg)',
        text: 'var(--status-stable)',
      };
    case 'Official':
      return {
        bg: 'var(--status-official-bg)',
        text: 'var(--status-official)',
      };
    case 'Unstable':
      return {
        bg: 'var(--status-unstable-bg)',
        text: 'var(--status-unstable)',
      };
    case 'In Review':
      return {
        bg: 'var(--status-in-review-bg)',
        text: 'var(--status-in-review)',
      };
    case 'Broken':
      return {
        bg: 'var(--status-broken-bg)',
        text: 'var(--status-broken)',
      };
    case 'Merged':
      return {
        bg: 'var(--status-merged-bg)',
        text: 'var(--status-merged)',
      };
    case 'Index Only':
      return {
        bg: 'var(--status-index-only-bg)',
        text: 'var(--status-index-only)',
      };
    case 'APWorld Only':
      return {
        bg: 'var(--status-apworld-only-bg)',
        text: 'var(--status-apworld-only)',
      };
    default:
      return {
        bg: '#f5f5f5',
        text: '#737373',
      };
  }
};

const GameCardComponent = ({ game, index }: GameCardProps) => {
  const statusColors = getStatusColors(game.Status);

  return (
    <li
      className='group relative grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_120px_100px] lg:grid-cols-[1fr_140px_100px_120px] gap-2 sm:gap-4 lg:gap-6 px-2 sm:px-6 py-3.5 border-b border-border hover:bg-muted/30 transition-all duration-200 hover:shadow-sm'
      style={{
        animation: `fadeIn 0.3s ease-out ${index * 0.005}s forwards`,
        opacity: 0,
      }}
    >
      {/* Game name - flexible width */}
      <div className='flex items-center min-w-0'>
        <h3 className='font-medium text-[15px] text-foreground truncate group-hover:text-accent transition-colors'>{game.Game}</h3>
      </div>

      {/* Status badge - responsive width */}
      <div className='flex items-center justify-end sm:justify-start'>
        <StatusBadgeTooltip status={game.Status} color={statusColors.text} bg={statusColors.bg} />
      </div>

      {/* Platform - hidden on mobile, visible on sm+ */}
      <div className='hidden sm:flex items-center'>
        <span className='font-mono text-[13px] font-medium text-muted-foreground uppercase tracking-wide'>{game.Platform}</span>
      </div>

      {/* Emulator - hidden on mobile and tablet, visible on lg+ */}
      <div className='hidden lg:flex items-center'>
        {game.Emulator ? (
          <span className='font-mono text-[12px] font-medium text-muted-foreground uppercase tracking-wide'>{game.Emulator}</span>
        ) : (
          <span className='font-mono text-[12px] text-muted-foreground/30'>—</span>
        )}
      </div>
    </li>
  );
};

export const GameCard = memo(GameCardComponent);
