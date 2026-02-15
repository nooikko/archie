'use client';

import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  return (
    <div className='flex items-center justify-center min-h-screen px-4'>
      <div className='max-w-md w-full space-y-6'>
        <div className='text-center'>
          <div className='text-6xl font-mono text-primary opacity-50 mb-4' style={{ fontFamily: 'var(--font-azeret-mono)' }}>
            ERROR
          </div>
        </div>

        <Alert variant='destructive' className='border-2'>
          <AlertCircle />
          <AlertTitle className='font-mono' style={{ fontFamily: 'var(--font-azeret-mono)' }}>
            Something went wrong!
          </AlertTitle>
          <AlertDescription>{error.message || 'An unexpected error occurred while loading this page.'}</AlertDescription>
        </Alert>

        <div className='text-center'>
          <button
            type='button'
            onClick={reset}
            className='px-6 py-3 bg-primary text-primary-foreground font-mono rounded hover:bg-primary/90 transition-colors shadow-[0_0_20px_rgba(57,255,20,0.3)]'
            style={{ fontFamily: 'var(--font-azeret-mono)' }}
          >
            TRY AGAIN
          </button>
        </div>
      </div>
    </div>
  );
}
