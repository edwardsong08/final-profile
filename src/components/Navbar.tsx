import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('hero');
  const [heroReady, setHeroReady] = useState(false);

  const isDark = theme === 'dark';

  const menuItems = [
    { label: 'Profile', href: '#hero', id: 'hero' },
    { label: 'Skills', href: '#skills', id: 'skills' },
    { label: 'Projects', href: '#projects', id: 'projects' },
    { label: 'Contact', href: '#contact', id: 'contact' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setHeroReady(true), 1800);
    return () => clearTimeout(timer);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, x: 40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.25, ease: 'easeOut' },
    },
    exit: { opacity: 0, x: 40, transition: { duration: 0.15 } },
  };

  useEffect(() => {
    const handleScroll = () => {
      let closest = 'hero';
      let minDist = Infinity;

      for (const item of menuItems) {
        const el = document.getElementById(item.id);
        if (el) {
          const offset = el.getBoundingClientRect().top;
          const halfScreen = window.innerHeight / 2;

          if (offset < halfScreen && offset > -halfScreen) {
            const dist = Math.abs(offset);
            if (dist < minDist) {
              minDist = dist;
              closest = item.id;
            }
          }
        }
      }

      setActiveSection(closest);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const barColor = isDark ? 'bg-white' : 'bg-zinc-800';

  return (
    <div className="fixed top-0 right-0 z-50">
      {/* Hamburger / X Toggle Icon */}
      {heroReady && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
          className={`fixed top-6 right-6 w-12 h-12 cursor-pointer group z-50 ${menuOpen ? 'open' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((prev) => !prev);
          }}
        >
          <span className={`absolute top-2.5 right-1 w-10 h-1 rounded-full transition-all duration-500 transform group-[.open]:rotate-45 group-[.open]:translate-y-2.5 ${barColor}`} />
          <span className={`absolute top-5 right-1 w-10 h-1 rounded-full transition-all duration-500 group-[.open]:scale-0 ${barColor}`} />
          <span className={`absolute top-8 right-1 w-10 h-1 rounded-full transition-all duration-500 transform group-[.open]:-rotate-45 group-[.open]:-translate-y-2.5 ${barColor}`} />
        </motion.div>
      )}

      {/* Menu Background & Content */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <LayoutGroup>
              <motion.ul
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={`fixed top-2 right-2 w-46 z-40 pt-24 pr-6 pb-6 pl-4 rounded-lg shadow-lg
                  ${isDark ? 'bg-zinc-900/90' : 'bg-white/90'} text-right space-y-6`}
              >
                {menuItems.map((item) => (
                  <motion.li key={item.href} className="relative">
                    <a
                      href={item.href}
                      className={`text-lg font-semibold transition-colors ${
                        activeSection === item.id
                          ? isDark
                            ? 'text-white'
                            : 'text-black'
                          : isDark
                            ? 'text-white/70 hover:text-white'
                            : 'text-black/70 hover:text-black'
                      }`}
                    >
                      {item.label}
                    </a>
                    {activeSection === item.id && (
                      <motion.div
                        layoutId="underline"
                        className={`absolute bottom-0 right-0 left-0 h-[2px] ${
                          isDark ? 'bg-white' : 'bg-black'
                        }`}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.li>
                ))}

                {/* Theme Toggle */}
                <motion.li className="text-right pr-2">
                  <div className="relative w-28 h-10 inline-block">
                    <input
                      type="checkbox"
                      id="theme-switch"
                      className="sr-only"
                      checked={isDark}
                      onChange={() => setTheme(isDark ? 'light' : 'dark')}
                    />
                    <label
                      htmlFor="theme-switch"
                      className="w-full h-full cursor-pointer bg-zinc-300 dark:bg-zinc-700 rounded-full border border-zinc-500 flex items-center relative overflow-hidden"
                    >
                      <motion.div
                        className="absolute w-14 h-8 rounded-full shadow-md flex justify-center items-center text-xs font-semibold"
                        layout
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        animate={{
                          x: isDark ? 56 : 0,
                          backgroundColor: isDark ? '#111827' : '#ffffff',
                          color: isDark ? '#ffffff' : '#111827',
                        }}
                        style={{ left: 0 }}
                      >
                        {isDark ? 'Dark' : 'Light'}
                      </motion.div>

                      <div className="flex justify-between w-full z-0 text-xs font-semibold px-3">
                        <span
                          className={`pl-[2px] transition-opacity duration-300 ${
                            !isDark ? 'opacity-0' : 'opacity-100 text-white'
                          }`}
                        >
                          Light
                        </span>
                        <span
                          className={`pr-[2px] transition-opacity duration-300 ${
                            isDark ? 'opacity-0' : 'opacity-100 text-white'
                          }`}
                        >
                          Dark
                        </span>
                      </div>
                    </label>
                  </div>
                </motion.li>
              </motion.ul>
            </LayoutGroup>

            {/* Overlay to close menu */}
            <div
              className="fixed inset-0 z-30"
              onClick={() => setMenuOpen(false)}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
