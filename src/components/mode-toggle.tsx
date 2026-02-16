'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function ModeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant='ghost' size='icon' className='size-9' aria-label='Toggle theme'>
        <Sun className='size-[1.2rem]' />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='size-9' aria-label='Toggle theme'>
          {theme === 'light' ? (
            <Sun className='size-[1.2rem]' />
          ) : theme === 'dark' ? (
            <Moon className='size-[1.2rem]' />
          ) : (
            <Monitor className='size-[1.2rem]' />
          )}
          <span className='sr-only'>Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='font-mono'>
        <DropdownMenuItem onClick={() => setTheme('light')} className='gap-2' aria-label='Switch to light mode'>
          <Sun className='size-4' />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')} className='gap-2' aria-label='Switch to dark mode'>
          <Moon className='size-4' />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')} className='gap-2' aria-label='Switch to system theme'>
          <Monitor className='size-4' />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
