import { useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';

const subscribeToHydration = () => () => {};
const getClientHydrationState = () => true;
const getServerHydrationState = () => false;

export function useDisplayTheme() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationState,
    getServerHydrationState
  );

  return {
    isDark: mounted ? resolvedTheme !== 'light' : true,
    setTheme,
  };
}
