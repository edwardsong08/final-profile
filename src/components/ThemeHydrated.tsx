// src/components/ThemeHydrated.tsx
import { useState, useEffect } from 'react';

export default function ThemeHydrated({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <>{children}</>;
}
