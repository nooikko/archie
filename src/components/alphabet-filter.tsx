import Link from 'next/link';

interface AlphabetFilterProps {
  selectedLetter: string | null;
  currentQuery: string;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const buildUrl = (letter: string | null, query: string) => {
  const params = new URLSearchParams();
  if (query) {
    params.set('q', query);
  }
  if (letter) {
    params.set('letter', letter);
  }
  const queryString = params.toString();
  return queryString ? `/?${queryString}` : '/';
};

export const AlphabetFilter = ({ selectedLetter, currentQuery }: AlphabetFilterProps) => {
  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center gap-3'>
        <span className='text-sm uppercase tracking-wider font-mono text-muted-foreground' style={{ fontFamily: 'var(--font-azeret-mono)' }}>
          Filter:
        </span>
        <Link
          href={buildUrl(null, currentQuery)}
          data-selected={selectedLetter === null}
          className='px-3 py-1.5 text-sm font-mono rounded transition-all duration-200 data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground data-[selected=true]:shadow-[0_0_20px_rgba(57,255,20,0.5)] data-[selected=false]:bg-card data-[selected=false]:text-muted-foreground data-[selected=false]:border data-[selected=false]:border-border data-[selected=false]:hover:border-primary data-[selected=false]:hover:text-primary'
          style={{ fontFamily: 'var(--font-azeret-mono)' }}
        >
          ALL
        </Link>
      </div>

      <div className='grid grid-cols-13 sm:grid-cols-26 gap-2'>
        {ALPHABET.map((letter) => (
          <Link
            key={letter}
            href={buildUrl(letter, currentQuery)}
            data-selected={selectedLetter === letter}
            className='aspect-square flex items-center justify-center text-sm font-mono rounded transition-all duration-200 data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground data-[selected=true]:shadow-[0_0_20px_rgba(57,255,20,0.5)] data-[selected=true]:scale-110 data-[selected=false]:bg-card data-[selected=false]:text-foreground data-[selected=false]:border data-[selected=false]:border-border data-[selected=false]:hover:border-primary data-[selected=false]:hover:text-primary data-[selected=false]:hover:scale-105'
            style={{ fontFamily: 'var(--font-azeret-mono)' }}
            aria-label={`Filter by letter ${letter}`}
          >
            {letter}
          </Link>
        ))}
      </div>
    </div>
  );
};
