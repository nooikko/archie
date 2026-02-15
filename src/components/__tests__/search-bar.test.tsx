import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchBar } from '../search-bar';

describe('SearchBar', () => {
  const mockOnSearch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the search input', () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    expect(screen.getByPlaceholderText(/search games/i)).toBeInTheDocument();
  });

  it('starts with empty value', () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    const input = screen.getByPlaceholderText(/search games/i) as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('displays search icon', () => {
    const { container } = render(<SearchBar onSearch={mockOnSearch} />);
    const searchIcon = container.querySelector('svg');
    expect(searchIcon).toBeInTheDocument();
  });

  it('calls onSearch after debounce delay', async () => {
    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText(/search games/i);
    fireEvent.change(input, { target: { value: 'mario' } });

    // Should not call immediately
    expect(mockOnSearch).not.toHaveBeenCalled();

    // Wait for debounce
    await waitFor(
      () => {
        expect(mockOnSearch).toHaveBeenCalledWith('mario');
      },
      { timeout: 500 },
    );

    expect(mockOnSearch).toHaveBeenCalledTimes(1);
  });

  it('debounces multiple keystrokes', async () => {
    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText(/search games/i);

    // Type multiple characters quickly
    fireEvent.change(input, { target: { value: 'm' } });
    fireEvent.change(input, { target: { value: 'ma' } });
    fireEvent.change(input, { target: { value: 'mar' } });

    // Should not have called yet
    expect(mockOnSearch).not.toHaveBeenCalled();

    // Wait for debounce with final value
    await waitFor(
      () => {
        expect(mockOnSearch).toHaveBeenCalledWith('mar');
      },
      { timeout: 500 },
    );

    // Should only call once with final value
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
  });

  it('updates local value immediately', () => {
    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText(/search games/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'zelda' } });

    // Input should update immediately
    expect(input.value).toBe('zelda');

    // But callback should not be called yet
    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it('disables input when isPending is true', () => {
    render(<SearchBar onSearch={mockOnSearch} isPending={true} />);
    const input = screen.getByPlaceholderText(/search games/i);
    expect(input).toBeDisabled();
  });

  it('has proper accessibility attributes', () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    const input = screen.getByPlaceholderText(/search games/i);
    expect(input).toHaveAttribute('aria-label', 'Search games by name, status, platform, or emulator');
    expect(input).toHaveAttribute('type', 'text');
  });
});
