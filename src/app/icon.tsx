import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default async function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0a0a',
        position: 'relative',
      }}
    >
      {/* Central node */}
      <div
        style={{
          position: 'absolute',
          left: '11px',
          top: '11px',
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: 'white',
        }}
      />

      {/* Surrounding nodes */}
      {[
        { x: 6, y: 6 },
        { x: 19, y: 6 },
        { x: 6, y: 19 },
        { x: 19, y: 19 },
      ].map((pos, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${pos.x}px`,
            top: `${pos.y}px`,
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
          }}
        />
      ))}

      {/* Connection lines (simplified for small size) */}
      <div
        style={{
          position: 'absolute',
          left: '0',
          top: '0',
          width: '100%',
          height: '100%',
          display: 'flex',
        }}
      >
        <svg width='32' height='32' viewBox='0 0 32 32' role='img' aria-label='ARCHIE icon with connected nodes'>
          <title>ARCHIE icon</title>
          <line x1='16' y1='16' x2='9' y2='9' stroke='rgba(255,255,255,0.5)' strokeWidth='1' />
          <line x1='16' y1='16' x2='22' y2='9' stroke='rgba(255,255,255,0.5)' strokeWidth='1' />
          <line x1='16' y1='16' x2='9' y2='22' stroke='rgba(255,255,255,0.5)' strokeWidth='1' />
          <line x1='16' y1='16' x2='22' y2='22' stroke='rgba(255,255,255,0.5)' strokeWidth='1' />
        </svg>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
