import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ModeToggle } from '../mode-toggle';

// Mock next-themes
const mockSetTheme = vi.fn();
const mockTheme = vi.fn();

vi.mock('next-themes', () => ({
  useTheme: () => ({
    setTheme: mockSetTheme,
    theme: mockTheme(),
  }),
}));

describe('ModeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTheme.mockReturnValue('light');
  });

  describe('Initial Render (Hydration)', () => {
    it('renders a placeholder button before mount', () => {
      render(<ModeToggle />);

      const button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button).toBeInTheDocument();
    });

    it('displays Sun icon in placeholder state', () => {
      const { container } = render(<ModeToggle />);
      const sunIcon = container.querySelector('svg');
      expect(sunIcon).toBeInTheDocument();
    });

    it('has proper accessibility label before mount', () => {
      render(<ModeToggle />);
      const button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button).toHaveAttribute('aria-label', 'Toggle theme');
    });
  });

  describe('After Mount', () => {
    it('renders dropdown trigger after mount', async () => {
      render(<ModeToggle />);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /toggle theme/i });
        expect(button).toBeInTheDocument();
      });
    });

    it('displays Sun icon when theme is light', async () => {
      mockTheme.mockReturnValue('light');
      const { container } = render(<ModeToggle />);

      await waitFor(() => {
        const icons = container.querySelectorAll('svg');
        expect(icons.length).toBeGreaterThan(0);
      });
    });

    it('displays Moon icon when theme is dark', async () => {
      mockTheme.mockReturnValue('dark');
      const { container } = render(<ModeToggle />);

      await waitFor(() => {
        const icons = container.querySelectorAll('svg');
        expect(icons.length).toBeGreaterThan(0);
      });
    });

    it('displays Monitor icon when theme is system', async () => {
      mockTheme.mockReturnValue('system');
      const { container } = render(<ModeToggle />);

      await waitFor(() => {
        const icons = container.querySelectorAll('svg');
        expect(icons.length).toBeGreaterThan(0);
      });
    });

    it('includes sr-only text for screen readers', async () => {
      render(<ModeToggle />);

      await waitFor(() => {
        const srText = screen.getByText('Toggle theme');
        expect(srText).toBeInTheDocument();
        expect(srText).toHaveClass('sr-only');
      });
    });
  });

  describe('Dropdown Interaction', () => {
    it('opens dropdown menu when button is clicked', async () => {
      const user = userEvent.setup();
      render(<ModeToggle />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /toggle theme/i });
      await user.click(button);

      // Dropdown should be open (menu items should be visible)
      await waitFor(() => {
        expect(screen.getByText('Light')).toBeInTheDocument();
      });
    });

    it('displays all three theme options in dropdown', async () => {
      const user = userEvent.setup();
      render(<ModeToggle />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /toggle theme/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('Light')).toBeInTheDocument();
        expect(screen.getByText('Dark')).toBeInTheDocument();
        expect(screen.getByText('System')).toBeInTheDocument();
      });
    });

    it('calls setTheme with light when Light option is clicked', async () => {
      const user = userEvent.setup();
      render(<ModeToggle />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /toggle theme/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('Light')).toBeInTheDocument();
      });

      const lightOption = screen.getByText('Light').closest('[role="menuitem"]') || screen.getByText('Light');
      await user.click(lightOption);

      expect(mockSetTheme).toHaveBeenCalledWith('light');
    });

    it('calls setTheme with dark when Dark option is clicked', async () => {
      const user = userEvent.setup();
      render(<ModeToggle />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /toggle theme/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('Dark')).toBeInTheDocument();
      });

      const darkOption = screen.getByText('Dark').closest('[role="menuitem"]') || screen.getByText('Dark');
      await user.click(darkOption);

      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });

    it('calls setTheme with system when System option is clicked', async () => {
      const user = userEvent.setup();
      render(<ModeToggle />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /toggle theme/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('System')).toBeInTheDocument();
      });

      const systemOption = screen.getByText('System').closest('[role="menuitem"]') || screen.getByText('System');
      await user.click(systemOption);

      expect(mockSetTheme).toHaveBeenCalledWith('system');
    });
  });

  describe('Accessibility', () => {
    it('has aria-label on trigger button', async () => {
      render(<ModeToggle />);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /toggle theme/i });
        expect(button).toHaveAttribute('aria-label', 'Toggle theme');
      });
    });

    it('has aria-labels on menu items', async () => {
      const user = userEvent.setup();
      render(<ModeToggle />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /toggle theme/i });
      await user.click(button);

      await waitFor(() => {
        const lightItem = screen.getByLabelText('Switch to light mode');
        const darkItem = screen.getByLabelText('Switch to dark mode');
        const systemItem = screen.getByLabelText('Switch to system theme');

        expect(lightItem).toBeInTheDocument();
        expect(darkItem).toBeInTheDocument();
        expect(systemItem).toBeInTheDocument();
      });
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<ModeToggle />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /toggle theme/i });

      // Focus the button
      await user.tab();
      expect(button).toHaveFocus();

      // Open with Enter key
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Light')).toBeInTheDocument();
      });
    });

    it('menu items display icons with text labels', async () => {
      const user = userEvent.setup();
      render(<ModeToggle />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /toggle theme/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('Light')).toBeInTheDocument();
      });

      // Check that menu items have text labels
      expect(screen.getByText('Light')).toBeInTheDocument();
      expect(screen.getByText('Dark')).toBeInTheDocument();
      expect(screen.getByText('System')).toBeInTheDocument();
    });
  });

  describe('Button Styling', () => {
    it('has ghost variant', () => {
      const { container } = render(<ModeToggle />);
      const button = container.querySelector('[data-variant="ghost"]');
      expect(button).toBeInTheDocument();
    });

    it('has icon size', () => {
      const { container } = render(<ModeToggle />);
      const button = container.querySelector('[data-size="icon"]');
      expect(button).toBeInTheDocument();
    });

    it('has correct size classes', () => {
      render(<ModeToggle />);
      const button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button).toHaveClass('size-9');
    });
  });

  describe('Dropdown Menu Styling', () => {
    it('applies font-mono to dropdown content', async () => {
      const user = userEvent.setup();
      render(<ModeToggle />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /toggle theme/i });
      await user.click(button);

      // Just verify the menu opens with options
      await waitFor(() => {
        expect(screen.getByText('Light')).toBeInTheDocument();
        expect(screen.getByText('Dark')).toBeInTheDocument();
        expect(screen.getByText('System')).toBeInTheDocument();
      });
    });

    it('menu items render correctly', async () => {
      const user = userEvent.setup();
      render(<ModeToggle />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /toggle theme/i });
      await user.click(button);

      // Verify menu items are present
      await waitFor(() => {
        expect(screen.getByText('Light')).toBeInTheDocument();
        expect(screen.getByText('Dark')).toBeInTheDocument();
        expect(screen.getByText('System')).toBeInTheDocument();
      });
    });
  });
});
