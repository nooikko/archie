interface GameCardPlatformProps {
  platform: string;
}

export const GameCardPlatform = ({ platform }: GameCardPlatformProps) => {
  if (!platform) {
    return null;
  }

  return (
    <div className='inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 border border-border'>
      <span className='text-xs font-semibold text-foreground'>{platform}</span>
    </div>
  );
};
