// src/pages/index.tsx
import { useState } from 'react';
import { NextSeo, SocialProfileJsonLd, WebPageJsonLd } from 'next-seo';
import Hero from '../components/Hero';
import Skills from '../components/Skills';
import Projects from '../components/Projects';
import ContactForm from '../components/ContactForm';
import Footer from '../components/Footer';
import AboutMeModal from '../components/AboutMeModal';

export default function Home() {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <>
      <NextSeo
        title="Edward Song | Full-Stack Engineer"
        description="Full-stack engineer building production systems across React/Next.js, Java/Spring Boot, Go, AWS, and applied AI. Portfolio featuring ClaimChain, TROA platform work, and production-focused engineering projects."
        canonical="https://www.edsong.xyz/"
      />
      <WebPageJsonLd
        id="https://www.edsong.xyz/#webpage"
        url="https://www.edsong.xyz/"
        title="Edward Song | Full-Stack Engineer"
        description="Full-stack engineer building production systems across React, Next.js, Java, Spring Boot, Go, AWS, and applied AI."
      />
      <SocialProfileJsonLd
        type="Person"
        name="Edward Song"
        url="https://www.edsong.xyz/"
        sameAs={[
          'https://www.linkedin.com/in/edward-y-song',
          'https://github.com/edwardsong08',
        ]}
      />

      <div className="scroll-smooth">
        <header id="hero">
          <Hero openAbout={() => setIsAboutOpen(true)} />
        </header>

        <section id="projects">
          <Projects />
        </section>

        <section id="skills">
          <Skills />
        </section>

        <section id="contact">
          <ContactForm />
        </section>

        <Footer openAbout={() => setIsAboutOpen(true)} />
      </div>

      <AboutMeModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </>
  );
}
