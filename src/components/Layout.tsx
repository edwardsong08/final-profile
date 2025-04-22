import type { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

type LayoutProps = { children: ReactNode };

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>

      <Footer />
    </div>
  );
}
