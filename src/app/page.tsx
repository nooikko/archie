import { GameBrowser } from '@/components/game-browser';
import { ScrollToTop } from '@/components/scroll-to-top';
import { allGames } from '@/lib/search';

const HomePage = () => {
  const gameCount = allGames.filter((game) => game.IsArchipelagoTool !== 'true').length;
  const toolCount = allGames.filter((game) => game.IsArchipelagoTool === 'true').length;

  return (
    <main className='relative min-h-screen'>
      {/* Scroll to top button */}
      <ScrollToTop />

      {/* Main content */}
      <div className='relative z-10 mx-auto px-2 sm:px-6 lg:px-8 py-8 max-w-[1920px]'>
        {/* Header */}
        <header className='mb-10 space-y-6'>
          {/* Title - Clean and bold */}
          <div>
            <h1 className='text-6xl md:text-7xl font-extrabold tracking-tight text-foreground'>ARCHIE</h1>
            <div className='flex items-center gap-4 mt-3'>
              <div className='h-px w-12 bg-foreground' />
              <p className='font-mono text-sm font-medium uppercase tracking-widest text-muted-foreground'>Multi-Game Randomizer Directory</p>
            </div>
          </div>

          {/* Stats bar */}
          <div className='flex flex-wrap items-center gap-4 text-sm'>
            <div className='inline-flex items-center gap-2.5 px-4 py-2 bg-foreground text-background border border-foreground'>
              <span className='font-mono font-bold text-[13px]'>{gameCount}</span>
              <span className='font-mono text-[11px] uppercase tracking-wider'>Games</span>
              <span className='font-mono text-[11px] opacity-50'>•</span>
              <span className='font-mono font-bold text-[13px]'>{toolCount}</span>
              <span className='font-mono text-[11px] uppercase tracking-wider'>Tools</span>
            </div>
            <div className='inline-flex items-center gap-2 px-4 py-2 border border-border bg-background'>
              <span className='font-mono text-[11px] text-muted-foreground uppercase tracking-wider'>Browse • Search • Filter</span>
            </div>
          </div>
        </header>

        {/* Game Browser with Search */}
        <GameBrowser allGames={allGames} />

        {/* Footer */}
        <footer className='mt-16 pt-8 border-t border-border'>
          <div className='flex flex-col md:flex-row items-center justify-between gap-6 text-sm'>
            <p className='font-mono text-[12px] text-muted-foreground uppercase tracking-wide'>
              Archipelago is a multi-game randomizer platform for experiencing games in new ways.
            </p>
            <a
              href='https://archipelago.gg'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background border border-foreground font-mono text-[11px] font-semibold uppercase tracking-wider hover:bg-background hover:text-foreground transition-all'
            >
              Visit Archipelago.gg →
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
};

export default HomePage;
