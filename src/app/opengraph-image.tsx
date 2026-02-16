import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'ARCHIE - Archipelago Game Directory';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0a0a',
        position: 'relative',
      }}
    >
      {/* Background pattern - connected nodes */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          opacity: 0.1,
        }}
      >
        {/* Grid of dots */}
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${(i % 5) * 25 + 10}%`,
              top: `${Math.floor(i / 5) * 33 + 15}%`,
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: 'white',
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '40px',
        }}
      >
        {/* Title */}
        <div
          style={{
            fontSize: '120px',
            fontWeight: 800,
            color: 'white',
            letterSpacing: '-0.02em',
          }}
        >
          ARCHIE
        </div>

        {/* Divider */}
        <div
          style={{
            width: '120px',
            height: '3px',
            backgroundColor: 'white',
          }}
        />

        {/* Subtitle */}
        <div
          style={{
            fontSize: '36px',
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.8)',
            letterSpacing: '0.1em',
            fontFamily: 'monospace',
          }}
        >
          MULTI-GAME RANDOMIZER DIRECTORY
        </div>

        {/* Stats */}
        <div
          style={{
            fontSize: '28px',
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.6)',
            letterSpacing: '0.05em',
            fontFamily: 'monospace',
          }}
        >
          500+ Games • Instant Search • Filter by Platform
        </div>

        {/* Domain */}
        <div
          style={{
            fontSize: '28px',
            fontWeight: 600,
            color: 'white',
            marginTop: '20px',
            fontFamily: 'monospace',
          }}
        >
          archie-search.vercel.app
        </div>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
