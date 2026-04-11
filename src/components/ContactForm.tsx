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
          <p className="text-base mb-4">
            I build production systems across React/Next.js, Java/Spring Boot, Go, AWS, and applied AI, and I am actively exploring new engineering opportunities.
          </p>
          <ul className="space-y-4 text-base">
            <li>
              Interested in full-stack, frontend-heavy full-stack, platform, and systems-focused software engineering roles.
            </li>
            <li>
              Open to conversations with recruiters, hiring managers, and employers looking for strong product-minded engineering ownership.
            </li>
            <li>
              Comfortable driving work end to end across frontend, backend, cloud infrastructure, and applied AI integrations.
            </li>
            <li>
              Resume, GitHub, and LinkedIn are available elsewhere on this site for quick review.
            </li>
          </ul>
          <p className="mt-6 font-medium">
            If you are hiring, feel free to reach out for opportunities, interviews, or technical conversations.
          </p>
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
