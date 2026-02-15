import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ErrorBoundary from '../error';

describe('Error Boundary', () => {
  const mockReset = vi.fn();
  const mockError = new Error('Test error message');

  it('renders error title', () => {
    render(<ErrorBoundary error={mockError} reset={mockReset} />);
    expect(screen.getByText('Something went wrong!')).toBeInTheDocument();
  });

  it('renders error message', () => {
    render(<ErrorBoundary error={mockError} reset={mockReset} />);
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('renders default message when error message is empty', () => {
    const emptyError = new Error();
    render(<ErrorBoundary error={emptyError} reset={mockReset} />);
    expect(screen.getByText('An unexpected error occurred while loading this page.')).toBeInTheDocument();
  });

  it('renders ERROR text header', () => {
    render(<ErrorBoundary error={mockError} reset={mockReset} />);
    expect(screen.getByText('ERROR')).toBeInTheDocument();
  });

  it('renders try again button', () => {
    render(<ErrorBoundary error={mockError} reset={mockReset} />);
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('calls reset function when try again button is clicked', async () => {
    const user = userEvent.setup();
    render(<ErrorBoundary error={mockError} reset={mockReset} />);

    const button = screen.getByRole('button', { name: /try again/i });
    await user.click(button);

    expect(mockReset).toHaveBeenCalledOnce();
  });

  it('renders alert with destructive variant', () => {
    const { container } = render(<ErrorBoundary error={mockError} reset={mockReset} />);
    // Look for the alert element - it should have border-2 class
    const alert = container.querySelector('.border-2');
    expect(alert).toBeInTheDocument();
  });

  it('renders alert icon', () => {
    const { container } = render(<ErrorBoundary error={mockError} reset={mockReset} />);
    // AlertCircle icon should be rendered
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('renders with proper layout structure', () => {
    const { container } = render(<ErrorBoundary error={mockError} reset={mockReset} />);
    const mainContainer = container.querySelector('.min-h-screen');
    expect(mainContainer).toBeInTheDocument();
  });

  it('renders with max-width container for content', () => {
    const { container } = render(<ErrorBoundary error={mockError} reset={mockReset} />);
    const contentContainer = container.querySelector('.max-w-md');
    expect(contentContainer).toBeInTheDocument();
  });

  it('handles error with digest property', () => {
    const errorWithDigest = Object.assign(new Error('Error with digest'), { digest: 'abc123' });
    render(<ErrorBoundary error={errorWithDigest} reset={mockReset} />);
    expect(screen.getByText('Error with digest')).toBeInTheDocument();
  });

  it('button has correct styling', () => {
    render(<ErrorBoundary error={mockError} reset={mockReset} />);
    const button = screen.getByRole('button', { name: /try again/i });
    expect(button).toHaveClass('font-mono');
  });
});
