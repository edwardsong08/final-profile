// src/components/ContactForm.tsx
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { useState } from 'react';

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
        reset(); // clear form
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
    <section id="contact" className="bg-zinc-800 text-zinc-100">
      {/* Top Bar */}
      <div className="bg-zinc-900 py-8">
        <h2 className="text-4xl font-bold text-center">Contact</h2>
      </div>

      {/* Form Area */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="bg-zinc-700 p-8 rounded-2xl shadow-md hover:shadow-xl transition-all"
        >
          {/* Name Field */}
          <div className="mb-6">
            <label htmlFor="name" className="block mb-2 font-semibold">
              Name
            </label>
            <input
              id="name"
              {...register('name')}
              className="w-full bg-zinc-800 text-white border border-zinc-600 px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-2">{errors.name.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="mb-6">
            <label htmlFor="email" className="block mb-2 font-semibold">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="w-full bg-zinc-800 text-white border border-zinc-600 px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-2">{errors.email.message}</p>
            )}
          </div>

          {/* Message Field */}
          <div className="mb-8">
            <label htmlFor="message" className="block mb-2 font-semibold">
              Message
            </label>
            <textarea
              id="message"
              {...register('message')}
              className="w-full bg-zinc-800 text-white border border-zinc-600 px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 h-40"
            />
            {errors.message && (
              <p className="text-red-400 text-sm mt-2">{errors.message.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all"
          >
            {isSubmitting ? 'Sending…' : 'Send Message'}
          </button>

          {/* Feedback Messages */}
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
        </motion.form>
      </div>
    </section>
  );
}
