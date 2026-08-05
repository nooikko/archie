import { Analytics } from '@vercel/analytics/next';
import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Outfit } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://archie.findquinn.com'),
  title: {
    default: 'ARCHIE - Archipelago Multi-Game Randomizer Directory',
    template: '%s | ARCHIE',
  },
  // Keep under 160 chars so Google does not truncate it in search results.
  description:
    'Search and discover 500+ games and tools in the Archipelago multi-world randomizer ecosystem. Filter instantly by status, platform, and emulator.',
  keywords: ['Archipelago', 'randomizer', 'multi-world', 'multi-game', 'game randomizer', 'retro games', 'speedrun', 'ROM hack', 'game mods'],
  authors: [{ name: 'ARCHIE' }],
  creator: 'ARCHIE',
  publisher: 'ARCHIE',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/site.webmanifest',
  // Default canonical for the home page; every other route overrides this in its own metadata.
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://archie.findquinn.com',
    siteName: 'ARCHIE',
    title: 'ARCHIE - Archipelago Game Directory',
    description: 'Search 500+ games in the Archipelago multi-world randomizer ecosystem. Instant filtering by status, platform, and emulator.',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@nooikko',
    creator: '@nooikko',
    title: 'ARCHIE - Archipelago Game Directory',
    description: 'Search 500+ games in the Archipelago multi-world randomizer ecosystem.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${outfit.variable} ${jetbrainsMono.variable} antialiased`} style={{ fontFamily: 'var(--font-outfit)' }}>
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
