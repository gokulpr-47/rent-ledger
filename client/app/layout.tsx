import type { Metadata } from 'next';
import './globals.css';
import EmotionRegistry from '@/lib/EmotionRegistry';
import Sidebar from '@/components/layout/Sidebar';
import { LoadingProvider } from '@/lib/providers/LoadingProvider';

export const metadata: Metadata = {
  title: 'RentLedger',
  description: 'Shop Rental Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <EmotionRegistry>
          <LoadingProvider>
            <div className="flex min-h-screen" style={{ backgroundColor: 'var(--color-surface)' }}>
              <Sidebar />
              <main className="flex-1 ml-60 flex flex-col min-h-screen">
                {children}
              </main>
            </div>
          </LoadingProvider>
        </EmotionRegistry>
      </body>
    </html>
  );
}
