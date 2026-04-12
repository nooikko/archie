import { NextResponse } from 'next/server';
import { allGames } from '@/lib/search';

const STATS = {
  games: () => {
    const count = allGames.filter((g) => g.Type === 'Game').length;
    return { label: 'games supported', message: count.toLocaleString(), color: 'blueviolet' };
  },
  apworlds: () => {
    const count = allGames.filter((g) => g.DownloadUrl).length;
    return { label: 'APWorlds available', message: count.toLocaleString(), color: '5865F2' };
  },
  platforms: () => {
    const count = new Set(allGames.map((g) => g.Platform).filter(Boolean)).size;
    return { label: 'platforms', message: count.toLocaleString(), color: '0ea5e9' };
  },
} satisfies Record<string, () => { label: string; message: string; color: string }>;

export const revalidate = 3600;

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stat = searchParams.get('stat') as keyof typeof STATS | null;

  if (!stat || !(stat in STATS)) {
    return NextResponse.json({ error: `Unknown stat. Valid: ${Object.keys(STATS).join(', ')}` }, { status: 400 });
  }

  return NextResponse.json({ schemaVersion: 1, ...STATS[stat]() }, { headers: { 'Cache-Control': 'public, max-age=3600' } });
}
