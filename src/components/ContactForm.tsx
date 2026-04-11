import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useEmailCopy } from './EmailCopyProvider';

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
  const [activeSlide, setActiveSlide] = useState<0 | 1>(0);
  const { resolvedTheme } = useTheme();
  const { copyEmail } = useEmailCopy();
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

      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col lg:flex-row gap-8">
        {/* Info Panel */}
        <div className={`${infoCardBg} p-7 rounded-2xl shadow-md hover:shadow-lg hover:shadow-emerald-400/40 lg:w-1/2 lg:min-h-[520px]`}>
          <h3 className="text-2xl font-semibold mb-4">Open to Software Engineering Opportunities</h3>
          <div className="space-y-3 text-base">
            <p>I’m currently seeking software engineering roles where I can contribute across product, platform, and systems work.</p>
            <p>Recent work has included full-stack product development, internal platform tooling, production debugging, infrastructure coordination, and applied AI integrations.</p>
            <p>I’m especially drawn to technology that improves real workflows and creates practical, positive impact for users, teams, and communities.</p>
            <p>Most interested in full-stack, platform, and systems-focused roles where strong engineering ownership, product sense, and thoughtful execution matter.</p>
            <p>Open to conversations with recruiters, hiring managers, and teams about opportunities, interviews, and technical discussions.</p>
          </div>
        </div>

        {/* Contact Panel */}
        <div className={`${formBg} p-7 rounded-2xl shadow-md hover:shadow-lg hover:shadow-emerald-400/40 lg:w-1/2 lg:min-h-[520px] flex flex-col`}>
          <div className="overflow-hidden flex-1">
            <div
              className={`flex w-[200%] transform-gpu transition-transform duration-300 ease-out ${
                activeSlide === 0 ? 'translate-x-0' : '-translate-x-1/2'
              }`}
            >
              <div className="w-1/2 flex-shrink-0 px-1">
                <div className="h-full flex flex-col">
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">Best Ways to Reach Me</h3>
                    <p className={`text-base ${isDark ? 'text-zinc-200' : 'text-zinc-700'}`}>
                      For opportunities, interviews, and technical conversations, these are the fastest ways to connect.
                    </p>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => void copyEmail()}
                      className="inline-flex w-full items-center justify-center rounded-lg px-3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm sm:text-base font-semibold transition-colors"
                    >
                      Email Me
                    </button>
                    <a
                      href="/Resume-Edward_Song.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center rounded-lg px-3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm sm:text-base font-semibold transition-colors"
                    >
                      View Resume
                    </a>
                    <a
                      href="https://www.linkedin.com/in/edward-y-song"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex w-full items-center justify-center rounded-lg px-3 py-3 text-sm sm:text-base font-medium border transition-colors ${
                        isDark
                          ? 'border-zinc-500 text-zinc-200 hover:text-white hover:border-zinc-300'
                          : 'border-zinc-400 text-zinc-700 hover:text-zinc-900 hover:border-zinc-600'
                      }`}
                    >
                      LinkedIn
                    </a>
                    <a
                      href="https://github.com/edwardsong08"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex w-full items-center justify-center rounded-lg px-3 py-3 text-sm sm:text-base font-medium border transition-colors ${
                        isDark
                          ? 'border-zinc-500 text-zinc-200 hover:text-white hover:border-zinc-300'
                          : 'border-zinc-400 text-zinc-700 hover:text-zinc-900 hover:border-zinc-600'
                      }`}
                    >
                      GitHub
                    </a>
                  </div>
                </div>
              </div>

              <div className="w-1/2 flex-shrink-0 px-1">
                <form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col">
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
            </div>
          </div>

          <div className={`mt-4 pt-3 border-t ${isDark ? 'border-zinc-600/50' : 'border-zinc-300/70'}`}>
            <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              aria-label="Show quick contact options"
              onClick={() => setActiveSlide(0)}
              className={`h-2.5 w-2.5 rounded-full border transition-colors ${
                activeSlide === 0
                  ? isDark
                    ? 'bg-white border-white'
                    : 'bg-zinc-800 border-zinc-800'
                  : isDark
                    ? 'bg-transparent border-zinc-400 hover:border-zinc-200'
                    : 'bg-transparent border-zinc-400 hover:border-zinc-700'
              }`}
            />
            <button
              type="button"
              aria-label="Show contact form"
              onClick={() => setActiveSlide(1)}
              className={`h-2.5 w-2.5 rounded-full border transition-colors ${
                activeSlide === 1
                  ? isDark
                    ? 'bg-white border-white'
                    : 'bg-zinc-800 border-zinc-800'
                  : isDark
                    ? 'bg-transparent border-zinc-400 hover:border-zinc-200'
                    : 'bg-transparent border-zinc-400 hover:border-zinc-700'
              }`}
            />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
