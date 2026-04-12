import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Game } from '@/lib/search';
import { GameCard } from '../index';

const mockGame: Game = {
  Game: 'Test Game',
  Type: 'Game',
  Status: 'Stable',
  Platform: 'PC',
  Emulator: '',
  PrStatus: '',
  DownloadUrl: '',
  IsBundled: false,
  IsDiscordOnly: false,
  IsCoreVerified: false,
  IsAdultContent: false,
  Notes: '',
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

  it('renders game title as a link when DownloadUrl is set', () => {
    const gameWithLink = { ...mockGame, DownloadUrl: 'https://example.com/game' };
    render(<GameCard game={gameWithLink} index={0} />);
    const link = screen.getByRole('link', { name: 'Test Game' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com/game');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders NoLinkTooltip when DownloadUrl is absent', () => {
    render(<GameCard game={mockGame} index={0} />);
    expect(screen.queryByRole('link', { name: 'Test Game' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'No download link available' })).toBeInTheDocument();
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
