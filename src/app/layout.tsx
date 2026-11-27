import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tri-Axium Digital | The Braxtonian Knowledge System',
  description: 'Interactive platform for navigating the Tri-Axium Writings integration schematics',
  icons: { icon: '/TCF_logo_ICO.webp' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-bx-black text-bx-white font-mono">
        {children}
      </body>
    </html>
  );
}
