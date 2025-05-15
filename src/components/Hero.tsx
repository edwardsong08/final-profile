// src/components/Hero.tsx
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { FaEnvelope, FaLinkedin, FaGithub } from "react-icons/fa";
import { useTheme } from "next-themes";

interface HeroProps {
  onReady?: () => void;
  openAbout: () => void;
}

interface NavigatorUAData {
  getHighEntropyValues: (hints: string[]) => Promise<{ model?: string }>;
}
interface NavigatorWithUA extends Navigator {
  userAgentData?: NavigatorUAData;
}

export default function Hero({ onReady, openAbout }: HeroProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [ready, setReady] = useState(false);

  const { theme, setTheme } = useTheme();
  const { scrollY } = useScroll();
  const mountainY = useTransform(scrollY, [0, 300], [0, 30]);

  useEffect(() => {
    const fallbackHeight = window.innerHeight;
    const getHeightFromModel = (model: string | undefined): number | null => {
      if (!model) return null;
      model = model.toUpperCase();
      if (/SM-G991/.test(model)) return 679;
      if (/SM-G996/.test(model)) return 701;
      if (/SM-G998/.test(model)) return 719;
      if (/SM-S901/.test(model)) return 679;
      if (/SM-S906/.test(model)) return 701;
      if (/SM-S908/.test(model)) return 719;
      if (/SM-S911/.test(model)) return 679;
      if (/SM-S916/.test(model)) return 701;
      if (/SM-S918/.test(model)) return 719;
      if (/SM-S921/.test(model)) return 679;
      if (/SM-S926/.test(model)) return 701;
      if (/SM-S928/.test(model)) return 719;
      return null;
    };

    const applyHeight = async () => {
      let matchedHeight: number | null = null;
      const nav = navigator as NavigatorWithUA;
      if (nav.userAgentData) {
        try {
          const data = await nav.userAgentData.getHighEntropyValues(["model"]);
          matchedHeight = getHeightFromModel(data.model);
        } catch {
          matchedHeight = null;
        }
      }
      if (matchedHeight === null) {
        const fallbackUA = navigator.userAgent.toUpperCase();
        matchedHeight = getHeightFromModel(fallbackUA);
      }
      const finalHeight = matchedHeight ?? fallbackHeight;
      if (sectionRef.current) {
        sectionRef.current.style.minHeight = `${finalHeight}px`;
        sectionRef.current.style.height = `${finalHeight}px`;
        setReady(true);
      }
    };

    applyHeight();

    if (window.innerWidth >= 1007) {
      const handleResize = () => {
        if (sectionRef.current) {
          sectionRef.current.style.minHeight = `${window.innerHeight}px`;
          sectionRef.current.style.height = `${window.innerHeight}px`;
        }
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  return (
    <motion.section
      ref={sectionRef}
      className="relative w-full overflow-hidden text-white px-4 flex flex-col justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: ready ? 1 : 0 }}
      transition={{ duration: 0.6 }}
      onAnimationComplete={() => {
        if (ready && onReady) onReady();
      }}
    >
      {/* Background image */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: "url('/darkhero.jpg')" }}
        initial={{ scale: 1.1, filter: "blur(20px)" }}
        animate={{ scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />

      {/* Moon/Sun Toggle with Rotation */}
      <motion.div
        className="absolute top-0 -translate-y-32 left-[10%] w-24 h-24 z-10 cursor-pointer group"
        initial={{ y: 0, scaleX: 1, scaleY: 1 }}
        animate={{
          y: [0, 230, 190, 210],
          scaleX: [1, 1.2, 0.95, 1],
          scaleY: [1, 0.8, 1.05, 1],
        }}
        transition={{ delay: 1.5, duration: 1.6, ease: [0.25, 0.1, 0.25, 1] }}
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        whileHover={{
          scale: 1.05,
          boxShadow: "0px 0px 12px rgba(255, 255, 255, 0.12)",
        }}
      >
        <motion.div
          animate={{ rotateY: theme === "dark" ? 0 : 180 }}
          transition={{ duration: 1.2 }}
          className="relative w-full h-full rounded-full"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front: Moon */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-300 to-gray-600 shadow-inner ring-2 ring-gray-300 backface-hidden" />

          {/* Back: Sun */}
          <div className="absolute inset-0 rotate-y-180 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 shadow-lg ring-4 ring-yellow-400 backface-hidden" />
        </motion.div>
      </motion.div>

      {/* Mountains Image */}
      <motion.div
        className="absolute bottom-0 left-0 w-full h-full z-[5]"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ delay: 1.5, duration: 1.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <motion.div style={{ y: mountainY }} className="relative w-full h-full">
          <Image
            src="/heromountain.png"
            alt="Hero Mountain"
            fill
            priority
            className="object-bottom object-cover"
          />
        </motion.div>
      </motion.div>

      {/* Main content */}
      <motion.div
        className="relative z-20 flex flex-col items-center justify-center text-center -translate-y-8 sm:-translate-y-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 30 }}
        transition={{ delay: 3.2, duration: 0.8, ease: "easeOut" }}
      >
        <div
          className="relative w-32 h-32 mb-4 cursor-pointer group"
          onClick={openAbout}
        >
          <Image
            src="/profile_pic.png"
            alt="Profile Picture"
            width={128}
            height={128}
            className="rounded-full border-4 border-white shadow-lg object-cover w-full h-full transition group-hover:brightness-75"
          />
          <svg
            className="absolute -top-8 -right-10 w-48 h-48 transition group-hover:brightness-75"
            viewBox="0 0 200 200"
          >
            <defs>
              <path
                id="aboutArc"
                d="M120,20 A70,70 0 0,1 170,80"
                fill="none"
              />
            </defs>
            <text
              fill="white"
              fontSize="12"
              fontWeight="bold"
              style={{
                textShadow: "0 0 2px rgba(255, 255, 255, 0.15)",
                transition: "all 0.3s ease-in-out",
              }}
              className="transition-transform group-hover:scale-105 origin-center"
            >
              <textPath
                href="#aboutArc"
                startOffset="0%"
                className="pointer-events-auto cursor-pointer"
              >
                About Me
              </textPath>
            </text>
          </svg>
        </div>

        <p className="text-xl mb-4">
          Self‑taught software developer based in the New York Metropolitan Area.
        </p>

        <div className="flex space-x-6 text-2xl mb-4">
          <a
            href="mailto:you@example.com"
            aria-label="Email"
            className="hover:text-gray-300 transition"
          >
            <FaEnvelope />
          </a>
          <a
            href="https://linkedin.com/in/yourprofile"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="hover:text-gray-300 transition"
          >
            <FaLinkedin />
          </a>
          <a
            href="https://github.com/yourusername"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="hover:text-gray-300 transition"
          >
            <FaGithub />
          </a>
        </div>

        <p className="italic">Striving for a habit of excellence.</p>
      </motion.div>
    </motion.section>
  );
}
