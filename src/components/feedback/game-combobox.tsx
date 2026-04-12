'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Game } from '@/lib/search';
import { cn } from '@/lib/utils';

interface GameComboboxProps {
  allGames: readonly Game[];
  value: string;
  onChange: (value: string) => void;
}

export function GameCombobox({ allGames, value, onChange }: GameComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const gameNames = Array.from(new Set(allGames.map((g) => g.Game))).sort();

  const filtered = search ? gameNames.filter((name) => name.toLowerCase().includes(search.toLowerCase())) : gameNames;

  const showNewGameOption = search.trim().length > 0 && !gameNames.some((n) => n.toLowerCase() === search.toLowerCase().trim());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant='outline' role='combobox' aria-expanded={open} className='w-full justify-between font-mono text-sm'>
          {value || <span className='text-muted-foreground'>Select or type a game...</span>}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-full p-0' align='start'>
        <Command shouldFilter={false}>
          <CommandInput placeholder='Search games...' value={search} onValueChange={setSearch} className='font-mono text-sm' />
          <CommandList>
            <CommandEmpty className='font-mono text-sm py-4 text-center text-muted-foreground'>No games found.</CommandEmpty>
            {filtered.length > 0 && (
              <CommandGroup>
                {filtered.map((name) => (
                  <CommandItem
                    key={name}
                    value={name}
                    onSelect={() => {
                      onChange(name);
                      setSearch('');
                      setOpen(false);
                    }}
                    className='font-mono text-sm'
                  >
                    <Check className={cn('mr-2 h-4 w-4', value === name ? 'opacity-100' : 'opacity-0')} />
                    {name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {showNewGameOption && (
              <CommandGroup heading='Not in the directory?'>
                <CommandItem
                  value={`__new__${search.trim()}`}
                  onSelect={() => {
                    onChange(search.trim());
                    setSearch('');
                    setOpen(false);
                  }}
                  className='font-mono text-sm text-muted-foreground'
                >
                  <span className='mr-2'>+</span>
                  Suggest new game: <span className='ml-1 text-foreground font-semibold'>{search.trim()}</span>
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
