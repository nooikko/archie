import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Loading from '../loading';

describe('Loading Page', () => {
  it('renders the loading skeleton', () => {
    const { container } = render(<Loading />);
    expect(container).toBeInTheDocument();
  });

  it('renders header skeletons', () => {
    const { container } = render(<Loading />);
    // Header has h-12 skeleton for title
    const headerSkeleton = container.querySelector('.h-12');
    expect(headerSkeleton).toBeInTheDocument();
  });

  it('renders search bar skeleton', () => {
    const { container } = render(<Loading />);
    // Search bar is in the Game Browser section with h-12 and w-full
    const searchSkeleton = container.querySelector('.h-12.w-full');
    expect(searchSkeleton).toBeInTheDocument();
  });

  it('renders 12 game list item skeletons', () => {
    const { container } = render(<Loading />);
    // Game list has 12 list items
    const listItems = container.querySelectorAll('ul.list-none > li');
    expect(listItems.length).toBe(12);
  });

  it('renders skeletons in a responsive grid layout', () => {
    const { container } = render(<Loading />);
    // Find the grid layout inside list items
    const grid = container.querySelector('ul.list-none > li > div.grid');
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass('grid-cols-[1fr_auto]');
    expect(grid).toHaveClass('sm:grid-cols-[1fr_120px_100px]');
    expect(grid).toHaveClass('lg:grid-cols-[1fr_140px_100px_120px]');
  });

  it('renders game list item skeleton with name and status elements', () => {
    const { container } = render(<Loading />);
    // Each list item has a skeleton for game name (w-3/4) and status badge (w-20)
    const nameSkeleton = container.querySelector('.w-3\\/4');
    const statusSkeleton = container.querySelector('.w-20');
    expect(nameSkeleton).toBeInTheDocument();
    expect(statusSkeleton).toBeInTheDocument();
  });

  it('renders game card skeleton with platform', () => {
    const { container } = render(<Loading />);
    // Platform skeleton has w-24 class
    const platformSkeleton = container.querySelector('.w-24');
    expect(platformSkeleton).toBeInTheDocument();
  });

  it('applies proper container styling', () => {
    const { container } = render(<Loading />);
    // Container now uses max-w-[1920px] instead of .container class
    const mainContainer = container.querySelector('.max-w-\\[1920px\\]');
    expect(mainContainer).toBeInTheDocument();
    expect(mainContainer).toHaveClass('mx-auto');
  });
});
