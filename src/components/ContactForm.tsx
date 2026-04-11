import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
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

  const isDark = resolvedTheme === 'dark';

  const bgSection = isDark ? 'bg-zinc-800 text-zinc-100' : 'bg-zinc-100 text-zinc-900';
  const bgHeader = isDark ? 'bg-zinc-900' : 'bg-zinc-200';
  const formBg = isDark ? 'bg-zinc-700' : 'bg-zinc-200';
  const inputBg = isDark ? 'bg-zinc-800 text-white border-zinc-600' : 'bg-zinc-100 text-black border-zinc-300';
  const infoCardBg = isDark ? 'bg-zinc-700' : 'bg-zinc-200';
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

      <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col lg:flex-row gap-8">
        {/* Info Panel */}
        <div className={`${infoCardBg} p-8 rounded-2xl shadow-md hover:shadow-lg hover:shadow-emerald-400/40 lg:w-1/2`}>
          <h3 className="text-2xl font-semibold mb-4">Open to Software Engineering Opportunities</h3>
          <div className="space-y-4 text-base">
            <p>I’m currently seeking software engineering roles where I can contribute across product, platform, and systems work.</p>
            <p>Most interested in full-stack, platform, and systems-focused roles where strong engineering ownership and product sense matter.</p>
            <p>Open to conversations with recruiters, hiring managers, and teams about opportunities, interviews, and technical discussions.</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-4 text-sm font-medium">
            <a
              href="/Resume-Edward_Song.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className={`${isDark ? 'text-zinc-200 hover:text-blue-300' : 'text-zinc-700 hover:text-blue-600'} transition-colors`}
            >
              Resume
            </a>
            <a
              href="https://github.com/edwardsong08"
              target="_blank"
              rel="noopener noreferrer"
              className={`${isDark ? 'text-zinc-200 hover:text-blue-300' : 'text-zinc-700 hover:text-blue-600'} transition-colors`}
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/edward-y-song"
              target="_blank"
              rel="noopener noreferrer"
              className={`${isDark ? 'text-zinc-200 hover:text-blue-300' : 'text-zinc-700 hover:text-blue-600'} transition-colors`}
            >
              LinkedIn
            </a>
            <a
              href="mailto:edwardsong08@gmail.com"
              className={`${isDark ? 'text-zinc-200 hover:text-blue-300' : 'text-zinc-700 hover:text-blue-600'} transition-colors`}
            >
              Email
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={`${formBg} p-8 rounded-2xl shadow-md hover:shadow-lg hover:shadow-emerald-400/40 lg:w-1/2`}
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
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg"
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
      </div>
    </section>
  );
}
