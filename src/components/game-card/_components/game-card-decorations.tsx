export const GameCardDecorations = () => {
  return (
    <>
      {/* Top-left corner */}
      <div
        className='absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300'
        aria-hidden='true'
      />
      {/* Top-right corner */}
      <div
        className='absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300'
        aria-hidden='true'
      />
      {/* Bottom-left corner */}
      <div
        className='absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300'
        aria-hidden='true'
      />
      {/* Bottom-right corner */}
      <div
        className='absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300'
        aria-hidden='true'
      />
    </>
  );
};
