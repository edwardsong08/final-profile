import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

const EMAIL_ADDRESS = 'edwardsong08@gmail.com';

type EmailCopyContextValue = {
  copyEmail: () => Promise<void>;
};

const EmailCopyContext = createContext<EmailCopyContextValue | null>(null);

export function EmailCopyProvider({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [toastVisible, setToastVisible] = useState(false);
  const [toastTick, setToastTick] = useState(0);
  const isDark = resolvedTheme === 'dark';

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(EMAIL_ADDRESS);
      setToastVisible(true);
      setToastTick((tick) => tick + 1);
    } catch {
      setToastVisible(false);
    }
  }, []);

  useEffect(() => {
    if (!toastVisible) return;
    const timeoutId = window.setTimeout(() => setToastVisible(false), 1600);
    return () => window.clearTimeout(timeoutId);
  }, [toastVisible, toastTick]);

  return (
    <EmailCopyContext.Provider value={{ copyEmail }}>
      {children}
      <div
        className={`pointer-events-none fixed left-1/2 bottom-6 z-[90] -translate-x-1/2 transition-all duration-300 ${
          toastVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
        }`}
        aria-live="polite"
      >
        <div
          className={`rounded-full px-4 py-2 text-xs font-medium shadow-md ${
            isDark ? 'bg-zinc-900/95 text-zinc-100 border border-zinc-700' : 'bg-white/95 text-zinc-800 border border-zinc-300'
          }`}
        >
          Email copied to clipboard
        </div>
      </div>
    </EmailCopyContext.Provider>
  );
}

export function useEmailCopy() {
  const context = useContext(EmailCopyContext);
  if (!context) {
    throw new Error('useEmailCopy must be used within EmailCopyProvider');
  }
  return context;
}
