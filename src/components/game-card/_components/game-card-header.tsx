import { Badge } from '@/components/ui/badge';

interface GameCardHeaderProps {
  gameName: string;
  status: string;
}

export const GameCardHeader = ({ gameName, status }: GameCardHeaderProps) => {
  const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
    Stable: { bg: '#e6fffb', text: '#00d26a', border: '#00d26a' },
    Official: { bg: '#e6f4ff', text: '#0091ff', border: '#0091ff' },
    Unstable: { bg: '#fff7e6', text: '#ff9500', border: '#ff9500' },
    'In Review': { bg: '#f3e6ff', text: '#9b51e0', border: '#9b51e0' },
    'Broken on Main': { bg: '#ffe6f0', text: '#ff3366', border: '#ff3366' },
    Merged: { bg: '#e6f9ff', text: '#00b8d4', border: '#00b8d4' },
    'Index Only': { bg: '#fff9e6', text: '#ffc107', border: '#ffc107' },
    'APWorld Only': { bg: '#ffe6f5', text: '#ff6b9d', border: '#ff6b9d' },
  };

  const style = statusStyles[status] || { bg: '#f0f0f0', text: '#666666', border: '#999999' };

  return (
    <div className='flex items-start justify-between gap-2'>
      <h3 className='text-base font-bold text-foreground leading-tight flex-1 line-clamp-2'>{gameName}</h3>
      <Badge
        variant='outline'
        className='shrink-0 px-2 py-0.5 text-[10px] font-bold uppercase border-2 whitespace-nowrap'
        style={{
          backgroundColor: style.bg,
          color: style.text,
          borderColor: style.border,
        }}
      >
        {status}
      </Badge>
    </div>
  );
};
