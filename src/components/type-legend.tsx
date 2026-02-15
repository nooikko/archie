'use client';

import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const typeDefinitions = [
  {
    name: 'GAME',
    color: 'var(--type-game)',
    bg: 'var(--type-game-bg)',
    description: 'A standalone video game that has been adapted for Archipelago multi-world randomization.',
  },
  {
    name: 'TOOL',
    color: 'var(--type-tool)',
    bg: 'var(--type-tool-bg)',
    description:
      'An Archipelago-specific tool or mini-game (like puzzles, quizzes, or utilities) designed to work within the Archipelago ecosystem. These are not standalone video games.',
  },
];

export const TypeLegend = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className='h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all group'
          aria-label='Show type legend'
        >
          <Info className='h-3.5 w-3.5 group-hover:scale-110 transition-transform' />
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='text-xl sm:text-2xl font-semibold tracking-tight'>Type Guide</DialogTitle>
          <DialogDescription className='text-xs sm:text-sm text-muted-foreground mt-1'>
            Understanding the difference between games and Archipelago-specific tools
          </DialogDescription>
        </DialogHeader>

        <div className='mt-6 grid grid-cols-1 gap-3'>
          {typeDefinitions.map((type, index) => (
            <div
              key={type.name}
              className='group p-4 rounded-lg border border-border/50 hover:border-border transition-all hover:shadow-sm bg-card/50'
              style={{
                animation: `fadeIn 0.3s ease-out ${index * 0.1}s forwards`,
                opacity: 0,
              }}
            >
              <div className='space-y-2'>
                <div
                  className='inline-flex items-center px-2.5 py-1 rounded text-[11px] font-mono font-semibold uppercase tracking-wider border'
                  style={{
                    backgroundColor: type.bg,
                    color: type.color,
                    borderColor: type.color,
                    borderWidth: '1px',
                    borderStyle: 'dashed',
                  }}
                >
                  {type.name}
                </div>
                <p className='text-sm text-muted-foreground leading-relaxed'>{type.description}</p>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
