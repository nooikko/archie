import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Game } from '@/lib/search';
import { GameCard } from '../index';

const mockGame: Game = {
  Game: 'Test Game',
  Status: 'Stable',
  Platform: 'PC',
  Emulator: '',
  IsArchipelagoTool: 'false',
};

describe('GameCard', () => {
  it('renders the game name', () => {
    render(<GameCard game={mockGame} index={0} />);
    expect(screen.getByText('Test Game')).toBeInTheDocument();
  });

  it('renders the status badge', () => {
    render(<GameCard game={mockGame} index={0} />);
    expect(screen.getByText('Stable')).toBeInTheDocument();
  });

  it('renders the platform', () => {
    render(<GameCard game={mockGame} index={0} />);
    expect(screen.getByText('PC')).toBeInTheDocument();
  });

  it('renders with animation class', () => {
    const { container } = render(<GameCard game={mockGame} index={3} />);
    const card = container.firstChild as HTMLElement;
    expect(card.style.animation).toContain('fadeIn');
  });

  it('renders without platform when platform is empty', () => {
    const gameWithoutPlatform = { ...mockGame, Platform: '' };
    render(<GameCard game={gameWithoutPlatform} index={0} />);
    expect(screen.queryByText('Platform:')).not.toBeInTheDocument();
  });

  it('renders Official status correctly', () => {
    const officialGame = { ...mockGame, Status: 'Official' };
    render(<GameCard game={officialGame} index={0} />);
    expect(screen.getByText('Official')).toBeInTheDocument();
  });

  it('renders Unstable status correctly', () => {
    const unstableGame = { ...mockGame, Status: 'Unstable' };
    render(<GameCard game={unstableGame} index={0} />);
    expect(screen.getByText('Unstable')).toBeInTheDocument();
  });
});
