import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ChatSphere - Real-time Chat App',
  description: 'A feature-rich real-time messaging application with AI integration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-dark text-white`}>
        <div className="flex h-screen overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
