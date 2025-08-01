'use client';

import { ClerkProvider as OriginalClerkProvider } from '@clerk/nextjs';
import { PropsWithChildren, Suspense } from 'react';
import { dark } from '@clerk/themes';
import { useIsDarkMode } from '@/hooks/useIsDarkMode';

export function ClerkProvider({ children }: Readonly<PropsWithChildren>) {
  const isDarkMode = useIsDarkMode();

  return (
    <Suspense>
      <OriginalClerkProvider appearance={isDarkMode ? { baseTheme: [dark] } : undefined }>
        {children}
      </OriginalClerkProvider>
    </Suspense>
  );
}