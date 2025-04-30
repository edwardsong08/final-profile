// src/components/Layout.tsx
import type { ReactNode } from 'react';

type LayoutProps = { children: ReactNode };

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">


      {/* No width or padding limits on main — child components manage their own layout */}
      <main className="flex-1 w-full">
        {children}
      </main>

    </div>
  );
}
