import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <main className='relative min-h-screen'>
      {/* Main content */}
      <div className='relative z-10 mx-auto px-2 sm:px-6 lg:px-8 py-8 max-w-480'>
        {/* Header */}
        <header className='mb-10 space-y-6'>
          {/* Title - Clean and bold */}
          <div>
            <Skeleton className='h-18 md:h-21 w-70 md:w-95 rounded-lg' />
            <div className='flex items-center gap-4 mt-3'>
              <Skeleton className='h-px w-12' />
              <Skeleton className='h-4 w-70 rounded' />
            </div>
          </div>

          {/* Stats bar */}
          <div className='flex flex-wrap items-center gap-4 text-sm'>
            <Skeleton className='h-10 w-40 rounded-none' />
            <Skeleton className='h-10 w-55 rounded-none' />
          </div>
        </header>

        {/* Game Browser Section */}
        <div className='space-y-6'>
          {/* Search bar skeleton */}
          <Skeleton className='h-12 w-full rounded-lg' />

          {/* Filters section */}
          <div className='space-y-4'>
            {/* Filter Controls */}
            <div className='flex flex-wrap items-center gap-2 sm:gap-3'>
              <Skeleton className='h-4 w-15 rounded' />
              <Skeleton className='h-10 w-25 rounded' />
              <Skeleton className='h-10 w-27.5 rounded' />
              <Skeleton className='h-10 w-27.5 rounded' />
            </div>
          </div>

          {/* Game Grid */}
          <div className='space-y-0'>
            {/* Header */}
            <div className='sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b-2 border-border'>
              <div className='grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_120px_100px] lg:grid-cols-[1fr_140px_100px_120px] gap-2 sm:gap-4 lg:gap-6 px-2 sm:px-6 py-3'>
                <div className='flex items-center gap-3'>
                  <Skeleton className='h-0.5 w-6' />
                  <Skeleton className='h-4 w-24 rounded' />
                </div>
                <div className='flex items-center gap-1.5 justify-end sm:justify-start'>
                  <Skeleton className='h-4 w-16 rounded' />
                </div>
                <Skeleton className='hidden sm:block h-4 w-20 rounded' />
                <Skeleton className='hidden lg:block h-4 w-20 rounded' />
              </div>
            </div>

            {/* Game list skeleton */}
            <ul className='list-none'>
              {Array.from({ length: 12 }).map((_, index) => (
                <li
                  key={`skeleton-${index}`}
                  className='border-b border-border hover:bg-muted/30 transition-colors'
                  style={{
                    animation: `fadeIn 0.5s ease-out ${index * 0.05}s both`,
                  }}
                >
                  <div className='grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_120px_100px] lg:grid-cols-[1fr_140px_100px_120px] gap-2 sm:gap-4 lg:gap-6 px-2 sm:px-6 py-4'>
                    {/* Game name */}
                    <Skeleton className='h-5 w-3/4 rounded' />
                    {/* Status badge */}
                    <Skeleton className='h-6 w-20 rounded-sm' />
                    {/* Platform (hidden on mobile) */}
                    <Skeleton className='hidden sm:block h-5 w-16 rounded' />
                    {/* Emulator (hidden on mobile and tablet) */}
                    <Skeleton className='hidden lg:block h-5 w-20 rounded' />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer skeleton */}
        <div className='mt-16 pt-8 border-t border-border'>
          <div className='flex flex-col md:flex-row items-center justify-between gap-6'>
            <Skeleton className='h-4 w-full md:w-100 rounded' />
            <Skeleton className='h-10.5 w-55 rounded-none' />
          </div>
        </div>
      </div>
    </main>
  );
}
