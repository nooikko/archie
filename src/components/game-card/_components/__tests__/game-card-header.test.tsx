import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GameCardHeader } from '../game-card-header';

describe('GameCardHeader', () => {
  it('renders the game name', () => {
    render(<GameCardHeader gameName='My Awesome Game' status='Stable' />);
    expect(screen.getByText('My Awesome Game')).toBeInTheDocument();
  });

  it('renders the status badge', () => {
    render(<GameCardHeader gameName='Test Game' status='Stable' />);
    expect(screen.getByText('Stable')).toBeInTheDocument();
  });

  it('applies correct styling for Stable status', () => {
    render(<GameCardHeader gameName='Test Game' status='Stable' />);
    const badge = screen.getByText('Stable');
    expect(badge).toHaveStyle({
      backgroundColor: '#e6fffb',
      color: '#00d26a',
      borderColor: '#00d26a',
    });
  });

  it('applies correct styling for Official status', () => {
    render(<GameCardHeader gameName='Test Game' status='Official' />);
    const badge = screen.getByText('Official');
    expect(badge).toHaveStyle({
      backgroundColor: '#e6f4ff',
      color: '#0091ff',
      borderColor: '#0091ff',
    });
  });

  it('applies correct styling for Unstable status', () => {
    render(<GameCardHeader gameName='Test Game' status='Unstable' />);
    const badge = screen.getByText('Unstable');
    expect(badge).toHaveStyle({
      backgroundColor: '#fff7e6',
      color: '#ff9500',
      borderColor: '#ff9500',
    });
  });

  it('applies default styling for unknown status', () => {
    render(<GameCardHeader gameName='Test Game' status='Unknown' />);
    const badge = screen.getByText('Unknown');
    expect(badge).toHaveStyle({
      backgroundColor: '#f0f0f0',
      color: '#666666',
      borderColor: '#999999',
    });
  });

  it('renders badge with border', () => {
    render(<GameCardHeader gameName='Test Game' status='Stable' />);
    const badge = screen.getByText('Stable');
    expect(badge).toHaveClass('border-2');
  });

  it('displays status in uppercase in badge', () => {
    render(<GameCardHeader gameName='Test Game' status='Stable' />);
    const badge = screen.getByText('Stable');
    expect(badge).toHaveClass('uppercase');
  });

  it('uses compact font size', () => {
    render(<GameCardHeader gameName='Test Game' status='Stable' />);
    const badge = screen.getByText('Stable');
    expect(badge).toHaveClass('text-[10px]');
  });

  it('uses bold font weight', () => {
    render(<GameCardHeader gameName='Test Game' status='Stable' />);
    const badge = screen.getByText('Stable');
    expect(badge).toHaveClass('font-bold');
  });
});
