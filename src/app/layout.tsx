import type { Metadata } from 'next';
import { JetBrains_Mono, Outfit } from 'next/font/google';
import './globals.css';

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
  title: 'Archipelago Search - Multi-Game Randomizer Directory',
  description:
    'Search and discover games available in the Archipelago multi-game randomizer platform. Browse 600+ games with detailed information about stability, sources, and setup guides.',
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang='en'>
      <body className={`${outfit.variable} ${jetbrainsMono.variable} antialiased`} style={{ fontFamily: 'var(--font-outfit)' }}>
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
