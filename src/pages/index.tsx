// src/pages/index.tsx
import { useState } from 'react';
import { NextSeo } from 'next-seo';
import Hero from '../components/Hero';
import Skills from '../components/Skills';
import Projects from '../components/Projects';
import ContactForm from '../components/ContactForm';
import Footer from '../components/Footer';
import AboutMeModal from '../components/AboutMeModal';

export default function Home() {
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false); // 🔹 Shared modal state

  return (
    <>
      <NextSeo
        title="Edward Song- Portfolio"
        description="Full‑stack developer specializing in Next.js, animations, and more."
      />

      <div className={`scroll-smooth ${!heroLoaded ? 'overflow-hidden' : 'overflow-visible'}`}>
        <header id="hero">
          <Hero onReady={() => setHeroLoaded(true)} openAbout={() => setIsAboutOpen(true)} />
        </header>

        {heroLoaded && (
          <>
            <section id="skills">
              <Skills />
            </section>

            <section id="projects">
              <Projects />
            </section>

            <section id="contact" >
              <ContactForm />
            </section>

            <Footer openAbout={() => setIsAboutOpen(true)} />
          </>
        )}
      </div>

      <AboutMeModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </>
  );
}
