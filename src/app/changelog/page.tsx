import type { Metadata } from 'next';
import { GitHubCorner } from '@/components/github-corner';
import { ModeToggle } from '@/components/mode-toggle';
import { ScrollToTop } from '@/components/scroll-to-top';
import { parseMarkdown, readChangelog } from '@/lib/changelog/parse';

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'Release history for ARCHIE — the Archipelago Multi-Game Randomizer Directory.',
};

const ChangelogPage = () => {
  const raw = readChangelog();
  const html = parseMarkdown(raw);

  return (
    <main className='relative min-h-screen'>
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
                <p className='font-mono text-sm font-medium uppercase tracking-widest text-muted-foreground'>Changelog</p>
              </div>
            </div>
            <div className='mr-10 sm:mr-16'>
              <ModeToggle />
            </div>
          </div>

          {/* Nav bar */}
          <div className='flex flex-wrap items-center gap-4 text-sm'>
            <a
              href='/'
              className='inline-flex items-center gap-2 px-4 py-2 border border-border bg-background hover:bg-foreground hover:text-background transition-all'
            >
              <span className='font-mono text-[11px] uppercase tracking-wider'>← Directory</span>
            </a>
            <a
              href='https://github.com/nooikko/archie/releases'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-2 px-4 py-2 border border-border bg-background hover:bg-foreground hover:text-background transition-all'
            >
              <span className='font-mono text-[11px] uppercase tracking-wider'>GitHub Releases →</span>
            </a>
          </div>
        </header>

        {/* Changelog content */}
        <div
          className='prose-changelog'
          // biome-ignore lint/security/noDangerouslySetInnerHtml: content is from a repo-owner-authored CHANGELOG.md
          dangerouslySetInnerHTML={{ __html: html }}
        />

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

export default ChangelogPage;
