import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('hero');

  const isDark = theme === 'dark';

  const menuItems = [
    { label: 'Profile', href: '#hero', id: 'hero' },
    { label: 'Skills', href: '#skills', id: 'skills' },
    { label: 'Projects', href: '#projects', id: 'projects' },
    { label: 'Contact', href: '#contact', id: 'contact' },
  ];

  // Fallback: Scroll-based detection
  useEffect(() => {
    const handleScroll = () => {
      let closest = 'hero';
      let minDist = Infinity;

      for (const item of menuItems) {
        const el = document.getElementById(item.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          const offset = Math.abs(rect.top);
          if (offset < minDist) {
            minDist = offset;
            closest = item.id;
          }
        }
      }

      setActiveSection(closest);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initialize

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-6 right-6 z-50">
      {/* Hamburger Icon */}
      <div
        className={`relative w-12 h-12 cursor-pointer group ${menuOpen ? 'open' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen((prev) => !prev);
        }}
      >
        <span className="absolute top-2.5 right-1 w-10 h-1 rounded-full bg-white transition-all duration-500 transform group-[.open]:rotate-45 group-[.open]:translate-y-2.5" />
        <span className="absolute top-5 right-1 w-10 h-1 rounded-full bg-white transition-all duration-500 group-[.open]:scale-0" />
        <span className="absolute top-8 right-1 w-10 h-1 rounded-full bg-white transition-all duration-500 transform group-[.open]:-rotate-45 group-[.open]:-translate-y-2.5" />
      </div>

      {/* Animated Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <LayoutGroup>
              <motion.ul
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute top-20 right-6 flex flex-col space-y-5 text-right z-40"
              >
                {menuItems.map((item, i) => (
                  <motion.li key={item.href} className="relative">
                    <a
                      href={item.href}
                      className={`text-lg font-semibold transition-colors ${
                        activeSection === item.id
                          ? 'text-white'
                          : 'text-white/70 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </a>
                    {activeSection === item.id && (
                      <motion.div
                        layoutId="underline"
                        className="absolute bottom-0 right-0 left-0 h-[2px] bg-white"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.li>
                ))}

                {/* Theme Toggle */}
                <motion.li className="pt-4">
                  <div
                    className="relative w-28 h-10 border border-white rounded-full flex items-center justify-between cursor-pointer overflow-hidden bg-white/10"
                    onClick={() => setTheme(isDark ? 'light' : 'dark')}
                  >
                    <div
                      className={`w-1/2 h-full flex items-center justify-center transition-all duration-300 ${
                        isDark ? 'bg-white text-black font-semibold' : 'text-white'
                      }`}
                    >
                      Dark
                    </div>
                    <div
                      className={`w-1/2 h-full flex items-center justify-center transition-all duration-300 ${
                        !isDark ? 'bg-white text-black font-semibold' : 'text-white'
                      }`}
                    >
                      Light
                    </div>
                  </div>
                </motion.li>
              </motion.ul>
            </LayoutGroup>

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
