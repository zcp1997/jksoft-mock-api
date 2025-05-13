import React from 'react';
import { JetBrains_Mono  } from 'next/font/google';
import Link from 'next/link';
import { Layers, BarChart2, FolderRootIcon } from 'lucide-react';
import './globals.css';

const inter = JetBrains_Mono({ subsets: ['latin'] });

export const metadata = {
  title: 'MockAPI - Simple mock API server',
  description: 'Create and manage mock APIs for development and testing',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): React.ReactElement {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <Link href="/" className="flex items-center text-2xl font-bold text-blue-600">
                <Layers className="mr-2" />
                MockAPI
              </Link>
              <nav className="flex space-x-4">
                <Link href="/" className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600">
                  <FolderRootIcon className="h-4 w-4 mr-1" />
                  <span>Projects</span>
                </Link>
                <Link href="/logs" className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600">
                  <BarChart2 className="h-4 w-4 mr-1" />
                  <span>Logs</span>
                </Link>
              </nav>
            </div>
          </div>
        </header>
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
        <footer className="bg-white border-t py-4">
          <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} MockAPI. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
} 