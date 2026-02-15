'use client';

import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const statusDefinitions = [
  {
    name: 'Official',
    color: 'var(--status-official)',
    bg: 'var(--status-official-bg)',
    description:
      "The game's APWorld is merged into the main Archipelago repository and ships with every Archipelago installation. These appear on archipelago.gg/games and can be generated on the website directly.",
  },
  {
    name: 'Merged',
    color: 'var(--status-merged)',
    bg: 'var(--status-merged-bg)',
    description: "Will be in the next version of Archipelago. The PR has been accepted but the release hasn't shipped yet.",
  },
  {
    name: 'In Review',
    color: 'var(--status-in-review)',
    bg: 'var(--status-in-review-bg)',
    description:
      'Attempting to get merged into Archipelago main. Usually can be assumed to be stable. These are sorted by PR date, except for major updates to already-supported games which get put at the top.',
  },
  {
    name: 'Stable',
    color: 'var(--status-stable)',
    bg: 'var(--status-stable-bg)',
    description:
      "Should be completely playable without major issues or workarounds. The host probably won't encounter much in the way of issues. Criteria for Stable includes: no common generation failures, no common accessibility issues, the client doesn't have issues that may require the host to use /send_location, and other similar ideas.",
  },
  {
    name: 'Unstable',
    color: 'var(--status-unstable)',
    bg: 'var(--status-unstable-bg)',
    description: 'Playable, but there are enough issues that the host should be prepared for problems.',
  },
  {
    name: 'APWorld Only',
    color: 'var(--status-apworld-only)',
    bg: 'var(--status-apworld-only-bg)',
    description:
      "Stable and more or less feature complete. Will only be released as an APWorld (i.e., the developer has no intention of submitting it to the main Archipelago repo — you'll always need to install it as a custom APWorld).",
  },
  {
    name: 'Broken on Main',
    color: 'var(--status-broken)',
    bg: 'var(--status-broken-bg)',
    description:
      "Not playable in the current version of Archipelago without a modified client and/or APWorld. (Typically means a recent Archipelago update broke compatibility and the community APWorld hasn't been updated yet.)",
  },
  {
    name: 'Index Only',
    color: 'var(--status-index-only)',
    bg: 'var(--status-index-only-bg)',
    description:
      "This is a status we assigned during our merge process for games that appeared in the Archipelago-Index package registry but weren't listed on the Xetaas sheet at all. It's not an original Xetaas category.",
  },
];

export const StatusLegend = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className='h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all group'
          aria-label='Show status legend'
        >
          <Info className='h-3.5 w-3.5 group-hover:scale-110 transition-transform' />
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-5xl max-h-[85vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-xl sm:text-2xl font-semibold tracking-tight'>Status Guide</DialogTitle>
          <DialogDescription className='text-xs sm:text-sm text-muted-foreground mt-1'>
            Understanding game development and availability statuses in the Archipelago ecosystem
          </DialogDescription>
        </DialogHeader>

        <div className='mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3'>
          {statusDefinitions.map((status, index) => (
            <div
              key={status.name}
              className='group p-4 rounded-lg border border-border/50 hover:border-border transition-all hover:shadow-sm bg-card/50'
              style={{
                animation: `fadeIn 0.3s ease-out ${index * 0.05}s forwards`,
                opacity: 0,
              }}
            >
              <div className='space-y-2'>
                <div
                  className='inline-flex items-center px-2.5 py-1 rounded text-[11px] font-mono font-semibold uppercase tracking-wider border'
                  style={{
                    backgroundColor: status.bg,
                    color: status.color,
                    borderColor: status.color,
                    borderWidth: '1px',
                  }}
                >
                  {status.name}
                </div>
                <p className='text-sm text-muted-foreground leading-relaxed'>{status.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className='mt-6 pt-4 border-t border-border/50'>
          <p className='text-xs text-muted-foreground/80 font-mono'>Hover over any status badge in the table to see its definition quickly.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
