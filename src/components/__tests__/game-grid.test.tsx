import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Game } from '@/lib/search';
import { GameGrid } from '../game-grid';

// Mock GameCard component
vi.mock('../game-card', () => ({
  GameCard: ({ game, index }: { game: Game; index: number }) => (
    <li data-testid={`game-card-${index}`}>
      <span data-testid={`game-${game.Game}`}>{game.Game}</span>
    </li>
  ),
}));

const mockGames: readonly Game[] = [
  {
    Game: 'Test Game 1',
    Status: 'Stable',
    Platform: 'PC',
    Emulator: '',
  },
  {
    Game: 'Test Game 2',
    Status: 'Official',
    Platform: 'SNES',
    Emulator: 'BizHawk',
  },
] as const;

describe('GameGrid', () => {
  describe('when games are provided', () => {
    it('renders the games count', () => {
      render(<GameGrid games={mockGames} />);

      expect(screen.getByText('(2)')).toBeInTheDocument();
    });

    it('uses correct singular form for single game', () => {
      const singleGame = [mockGames[0]];
      render(<GameGrid games={singleGame} />);

      expect(screen.getByText('(1)')).toBeInTheDocument();
    });

    it('uses correct plural form for multiple games', () => {
      render(<GameGrid games={mockGames} />);

      expect(screen.getByText('(2)')).toBeInTheDocument();
    });

    it('renders game list with games', () => {
      render(<GameGrid games={mockGames} />);

      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();
      expect(screen.getByTestId('game-Test Game 1')).toBeInTheDocument();
      expect(screen.getByTestId('game-Test Game 2')).toBeInTheDocument();
    });

    it('applies correct container spacing', () => {
      const { container } = render(<GameGrid games={mockGames} />);
      const mainDiv = container.querySelector('.space-y-0');
      expect(mainDiv).toBeInTheDocument();
    });

    it('displays games count with medium font weight', () => {
      render(<GameGrid games={mockGames} />);
      const countElement = screen.getByText('(2)');
      expect(countElement).toHaveClass('font-medium');
    });

    it('applies muted foreground color to count', () => {
      render(<GameGrid games={mockGames} />);
      const countElement = screen.getByText('(2)');
      expect(countElement).toHaveClass('text-muted-foreground/50');
    });
  });

  describe('when no games are provided', () => {
    it('renders empty state message', () => {
      render(<GameGrid games={[]} />);

      expect(screen.getByText('No games found')).toBeInTheDocument();
    });

    it('renders helpful instruction message', () => {
      render(<GameGrid games={[]} />);

      expect(screen.getByText(/Try adjusting your search criteria/i)).toBeInTheDocument();
    });

    it('does not render game list', () => {
      render(<GameGrid games={[]} />);

      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it('does not render games count', () => {
      render(<GameGrid games={[]} />);

      expect(screen.queryByText(/Games/)).not.toBeInTheDocument();
    });

    it('applies centered layout for empty state', () => {
      const { container } = render(<GameGrid games={[]} />);
      const emptyState = container.querySelector('.flex.items-center.justify-center');
      expect(emptyState).toBeInTheDocument();
    });

    it('applies correct spacing for empty state', () => {
      const { container } = render(<GameGrid games={[]} />);
      const textContainer = container.querySelector('.space-y-3');
      expect(textContainer).toBeInTheDocument();
    });

    it('renders emoji in empty state', () => {
      render(<GameGrid games={[]} />);
      expect(screen.getByText('🎮')).toBeInTheDocument();
    });

    it('renders with max-width container for content', () => {
      const { container } = render(<GameGrid games={[]} />);
      const contentDiv = container.querySelector('.max-w-md');
      expect(contentDiv).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles large number of games', () => {
      const largeGameList = Array.from({ length: 1000 }, (_, i) => ({
        Game: `Game ${i + 1}`,
        Status: 'Stable',
        Platform: 'PC',
        Emulator: '',
      }));

      render(<GameGrid games={largeGameList} />);
      expect(screen.getByText('(1000)')).toBeInTheDocument();
    });

    it('renders GameCard components for each game', () => {
      render(<GameGrid games={mockGames} />);
      expect(screen.getByTestId('game-card-0')).toBeInTheDocument();
      expect(screen.getByTestId('game-card-1')).toBeInTheDocument();
    });
  });
});
