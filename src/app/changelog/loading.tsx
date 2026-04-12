import { Skeleton } from '@/components/ui/skeleton';

const ChangelogLoading = () => {
  return (
    <main className='relative min-h-screen'>
      <div className='relative z-10 mx-auto px-2 sm:px-6 lg:px-8 py-8 max-w-480'>
        <header className='mb-10 space-y-6'>
          <Skeleton className='h-20 w-48 rounded-none' />
          <div className='flex gap-4'>
            <Skeleton className='h-9 w-28 rounded-none' />
            <Skeleton className='h-9 w-36 rounded-none' />
          </div>
        </header>
        <div className='space-y-10'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='space-y-3 pb-10 border-b border-border'>
              <Skeleton className='h-7 w-32 rounded-none' />
              <Skeleton className='h-4 w-full rounded' />
              <Skeleton className='h-4 w-5/6 rounded' />
              <Skeleton className='h-4 w-4/6 rounded' />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default ChangelogLoading;
