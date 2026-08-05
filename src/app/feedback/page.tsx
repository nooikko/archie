import type { Metadata } from 'next';
import Link from 'next/link';
import { FeedbackForm } from '@/components/feedback/feedback-form';
import { GitHubCorner } from '@/components/github-corner';
import { JsonLd } from '@/components/json-ld';
import { ModeToggle } from '@/components/mode-toggle';
import { ScrollToTop } from '@/components/scroll-to-top';
import { allGames } from '@/lib/search';
import { breadcrumbStructuredData } from '@/lib/structured-data';

export const metadata: Metadata = {
  title: 'Submit Feedback',
  description: 'Suggest data corrections, new games, or missing info for the ARCHIE directory.',
  alternates: {
    canonical: '/feedback',
  },
};

const FeedbackPage = () => {
  // Only the names reach the client: passing every Game object would inline the
  // whole ~240 KB catalog into this page's RSC payload.
  const gameNames = Array.from(new Set(allGames.map((game) => game.Game))).sort();

  return (
    <main className='relative min-h-screen'>
      <JsonLd data={breadcrumbStructuredData('Submit Feedback', '/feedback')} />
      <GitHubCorner href='https://github.com/nooikko/archie' />
      <ScrollToTop />

      <div className='relative z-10 mx-auto px-2 sm:px-6 lg:px-8 py-8 max-w-480'>
        {/* Header */}
        <header className='mb-10 space-y-6'>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <h1 className='text-6xl md:text-7xl font-extrabold tracking-tight text-foreground'>ARCHIE</h1>
              <div className='flex items-center gap-4 mt-3'>
                <div className='h-px w-12 bg-foreground' />
                <p className='font-mono text-sm font-medium uppercase tracking-widest text-muted-foreground'>Submit Feedback</p>
              </div>
            </div>
            <div className='mr-10 sm:mr-16 flex items-center gap-2'>
              <Link
                href='/changelog'
                className='inline-flex items-center px-3 py-1.5 border border-border bg-background hover:bg-foreground hover:text-background transition-all'
              >
                <span className='font-mono text-[11px] uppercase tracking-wider'>Changelog</span>
              </Link>
              <ModeToggle />
            </div>
          </div>

          {/* Nav bar */}
          <div className='flex flex-wrap items-center gap-4 text-sm'>
            <Link
              href='/'
              className='inline-flex items-center gap-2 px-4 py-2 border border-border bg-background hover:bg-foreground hover:text-background transition-all'
            >
              <span className='font-mono text-[11px] uppercase tracking-wider'>← Directory</span>
            </Link>
          </div>
        </header>

        {/* Intro */}
        <div className='mb-8 space-y-2 border-l-2 border-foreground/20 pl-4'>
          <p className='font-mono text-sm text-muted-foreground'>
            Found incorrect or missing data? Let us know. Your submission will be reviewed and the data updated manually — it won't be applied
            automatically.
          </p>
          <p className='font-mono text-xs text-muted-foreground/70'>
            Submissions create a GitHub issue in the ARCHIE repository and are visible to maintainers.
          </p>
        </div>

        {/* Form */}
        <div className='max-w-xl'>
          <FeedbackForm gameNames={gameNames} />
        </div>

        {/* Footer */}
        <footer className='mt-16 pt-8 border-t border-border space-y-6'>
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

export default FeedbackPage;
