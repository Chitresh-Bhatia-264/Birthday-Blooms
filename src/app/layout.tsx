
import type {Metadata} from 'next';
import './globals.css';
import {cn} from '@/lib/utils';
import {Header} from '@/components/header';
import {Toaster} from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/auth-context';

export const maxDuration = 60;

export const metadata: Metadata = {
  title: 'Birthday Bloom',
  description: 'Create magical 3D animated birthday videos with AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('min-h-screen bg-background font-body antialiased')}>
        <AuthProvider>
          <div className="relative flex min-h-dvh flex-col">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
