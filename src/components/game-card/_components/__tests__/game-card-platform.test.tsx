import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GameCardPlatform } from '../game-card-platform';

describe('GameCardPlatform', () => {
  it('renders platform text correctly', () => {
    render(<GameCardPlatform platform='PC' />);
    expect(screen.getByText('PC')).toBeInTheDocument();
  });

  it('returns null when platform is empty string', () => {
    const { container } = render(<GameCardPlatform platform='' />);
    expect(container.firstChild).toBeNull();
  });

  it('applies correct styling classes to platform value', () => {
    render(<GameCardPlatform platform='SNES' />);
    const platformValue = screen.getByText('SNES');
    expect(platformValue).toHaveClass('text-xs', 'font-semibold', 'text-foreground');
  });

  it('renders container with correct styling', () => {
    const { container } = render(<GameCardPlatform platform='Nintendo 64' />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('inline-flex', 'items-center', 'gap-1.5');
  });

  it('renders with badge-like styling', () => {
    const { container } = render(<GameCardPlatform platform='PS1' />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('px-2', 'py-1', 'rounded-md', 'bg-muted/50', 'border', 'border-border');
  });

  it('handles different platform values - PC', () => {
    render(<GameCardPlatform platform='PC' />);
    expect(screen.getByText('PC')).toBeInTheDocument();
  });

  it('handles different platform values - PS1', () => {
    render(<GameCardPlatform platform='PS1' />);
    expect(screen.getByText('PS1')).toBeInTheDocument();
  });

  it('handles different platform values - SNES', () => {
    render(<GameCardPlatform platform='SNES' />);
    expect(screen.getByText('SNES')).toBeInTheDocument();
  });

  it('handles different platform values - GameCube', () => {
    render(<GameCardPlatform platform='GameCube' />);
    expect(screen.getByText('GameCube')).toBeInTheDocument();
  });

  it('handles different platform values - Xbox', () => {
    render(<GameCardPlatform platform='Xbox' />);
    expect(screen.getByText('Xbox')).toBeInTheDocument();
  });

  it('handles platform values with special characters', () => {
    render(<GameCardPlatform platform='PlayStation 2' />);
    expect(screen.getByText('PlayStation 2')).toBeInTheDocument();
  });

  it('handles long platform names', () => {
    render(<GameCardPlatform platform='Nintendo Entertainment System' />);
    expect(screen.getByText('Nintendo Entertainment System')).toBeInTheDocument();
  });

  it('does not render when platform is undefined', () => {
    const { container } = render(<GameCardPlatform platform={undefined as unknown as string} />);
    expect(container.firstChild).toBeNull();
  });
});
