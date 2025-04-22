import { NextSeo } from 'next-seo';
import Hero from '../components/Hero';
import Skills from '../components/Skills';
import Projects from '../components/Projects';
import ContactForm from '../components/ContactForm';
import About from '../components/About';

export default function Home() {
  return (
    <>
      <NextSeo
        title="Home – My Portfolio"
        description="Full‑stack developer specializing in Next.js, animations, and more."
      />

      <Hero />
      <Skills />
      <Projects />
      <About />

      <section id="contact" className="py-16 bg-gray-50">
        <h2 className="text-3xl font-semibold text-center mb-8">Get in Touch</h2>
        <ContactForm />
      </section>
    </>
  );
}
