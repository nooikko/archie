import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

/**
 * 180x180 apple-touch-icon used when the site is added to an iOS home screen.
 * Mirrors the node-graph mark from icon.svg / icon.tsx at touch-icon scale.
 */
export default async function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0a0a',
      }}
    >
      <svg width='180' height='180' viewBox='0 0 512 512' role='img' aria-label='ARCHIE icon with connected nodes'>
        <title>ARCHIE icon</title>
        <line x1='256' y1='256' x2='170' y2='170' stroke='#ffffff' strokeWidth='12' opacity='0.5' />
        <line x1='256' y1='256' x2='342' y2='170' stroke='#ffffff' strokeWidth='12' opacity='0.5' />
        <line x1='256' y1='256' x2='170' y2='342' stroke='#ffffff' strokeWidth='12' opacity='0.5' />
        <line x1='256' y1='256' x2='342' y2='342' stroke='#ffffff' strokeWidth='12' opacity='0.5' />
        <circle cx='256' cy='256' r='48' fill='#ffffff' />
        <circle cx='170' cy='170' r='34' fill='#ffffff' opacity='0.9' />
        <circle cx='342' cy='170' r='34' fill='#ffffff' opacity='0.9' />
        <circle cx='170' cy='342' r='34' fill='#ffffff' opacity='0.9' />
        <circle cx='342' cy='342' r='34' fill='#ffffff' opacity='0.9' />
      </svg>
    </div>,
    {
      ...size,
    },
  );
}
