import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../theme-provider';

// Mock next-themes
vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('ThemeProvider', () => {
  it('renders children correctly', () => {
    render(
      <ThemeProvider>
        <div>Test Child Component</div>
      </ThemeProvider>,
    );

    expect(screen.getByText('Test Child Component')).toBeInTheDocument();
  });

  it('passes props to NextThemesProvider', () => {
    render(
      <ThemeProvider attribute='class' defaultTheme='dark'>
        <div>Content</div>
      </ThemeProvider>,
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders multiple children', () => {
    render(
      <ThemeProvider>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </ThemeProvider>,
    );

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
    expect(screen.getByText('Child 3')).toBeInTheDocument();
  });

  it('supports nested components', () => {
    render(
      <ThemeProvider>
        <div>
          <span>Nested Content</span>
        </div>
      </ThemeProvider>,
    );

    expect(screen.getByText('Nested Content')).toBeInTheDocument();
  });
});
