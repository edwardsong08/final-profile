// src/components/ContactForm.tsx
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

// Validation schema
const schema = yup
  .object({
    name: yup.string().required('Name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    message: yup.string().min(10, 'Message too short').required('Message is required'),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

export default function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const bgSection = resolvedTheme === 'dark' ? 'bg-zinc-800 text-zinc-100' : 'bg-zinc-100 text-zinc-900';
  const bgHeader = resolvedTheme === 'dark' ? 'bg-zinc-900' : 'bg-zinc-200';
  const formBg = resolvedTheme === 'dark' ? 'bg-zinc-700' : 'bg-zinc-200';
  const inputBg = resolvedTheme === 'dark' ? 'bg-zinc-800 text-white border-zinc-600' : 'bg-zinc-100 text-black border-zinc-300';
  const infoCardBg = resolvedTheme === 'dark' ? 'bg-zinc-700' : 'bg-zinc-200';
  const errorText = 'text-red-400 text-sm mt-2';

  const onSubmit = async (data: FormData) => {
    setStatus('idle');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setStatus('success');
        reset();
      } else {
        const errorData = await res.json();
        console.error('Error from server:', errorData);
        setStatus('error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus('error');
    }
  };

  return (
    <section id="contact" className={`${bgSection} transition-colors duration-300`}>
      <div className={`${bgHeader} py-8 transition-colors duration-300`}>
        <h2 className="text-4xl font-bold text-center">Contact</h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="max-w-7xl mx-auto px-4 py-12 flex flex-col lg:flex-row gap-8"
      >
        {/* Info Panel */}
        <div className={`${infoCardBg} p-8 rounded-2xl shadow-md hover:shadow-lg hover:shadow-emerald-400/40 transform hover:scale-103 transition-all lg:w-1/2`}>
          <h3 className="text-2xl font-semibold mb-4">Let’s Make Your Business Stand Out Online.</h3>
          <ul className="space-y-4 text-base">
            <li>
              <strong>Pixel-perfect, mobile-friendly design</strong><br />
              Your site will look flawless on every device — no cut corners, no broken layouts, even on tricky phones like Samsung Galaxy.
            </li>
            <li>
              <strong>SEO-optimized to attract more customers</strong><br />
              I build with SEO best practices so your site ranks higher and brings in real leads.
            </li>
            <li>
              <strong>Fast, secure, and scalable</strong><br />
              Lightweight code, modern tools, and API integrations like Google Maps and email mean your site works smoothly now and in the future.
            </li>
            <li>
              <strong>Custom solutions for your business</strong><br />
              Unlike generic site builders, I tailor every detail to match your brand, goals, and customers.
            </li>
          </ul>
          <p className="mt-6 font-medium">
            Ready to upgrade your online presence? <strong>Contact me today</strong> and let’s discuss how we can make your business shine.
          </p>
        </div>

        {/* Contact Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={`${formBg} p-8 rounded-2xl shadow-md hover:shadow-lg hover:shadow-emerald-400/40 transform hover:scale-103 transition-all lg:w-1/2`}
        >
          <div className="mb-6">
            <label htmlFor="name" className="block mb-2 font-semibold">
              Name
            </label>
            <input
              id="name"
              {...register('name')}
              className={`w-full px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 border ${inputBg}`}
            />
            {errors.name && <p className={errorText}>{errors.name.message}</p>}
          </div>

          <div className="mb-6">
            <label htmlFor="email" className="block mb-2 font-semibold">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className={`w-full px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 border ${inputBg}`}
            />
            {errors.email && <p className={errorText}>{errors.email.message}</p>}
          </div>

          <div className="mb-8">
            <label htmlFor="message" className="block mb-2 font-semibold">
              Message
            </label>
            <textarea
              id="message"
              {...register('message')}
              className={`w-full px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 border h-40 ${inputBg}`}
            />
            {errors.message && <p className={errorText}>{errors.message.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition-all"
          >
            {isSubmitting ? 'Sending…' : 'Send Message'}
          </button>

          {status === 'success' && (
            <p className="text-green-400 text-center mt-4">
              Message sent successfully!
            </p>
          )}
          {status === 'error' && (
            <p className="text-red-400 text-center mt-4">
              Failed to send message. Please try again.
            </p>
          )}
        </form>
      </motion.div>
    </section>
  );
}
