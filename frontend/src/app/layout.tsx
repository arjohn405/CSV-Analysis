import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { CSVProvider } from '@/context/CSVContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CSV Analytics Dashboard',
  description: 'Upload and analyze CSV files with interactive visualizations',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CSVProvider>
          {children}
        </CSVProvider>
      </body>
    </html>
  );
}
