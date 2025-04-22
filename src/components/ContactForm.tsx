// src/components/ContactForm.tsx
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';

// 1. Define your validation schema
const schema = yup
  .object({
    name:    yup.string().required('Name is required'),
    email:   yup.string().email('Invalid email').required('Email is required'),
    message: yup.string().min(10, 'Message too short').required('Message is required'),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

export default function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    console.log('Form data:', data);
    // TODO: call your sendEmail helper here
  };

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-lg mx-auto space-y-4 p-6 bg-white rounded shadow"
    >
      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block mb-1 font-medium">
          Name
        </label>
        <input
          id="name"
          {...register('name')}
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block mb-1 font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Message Field */}
      <div>
        <label htmlFor="message" className="block mb-1 font-medium">
          Message
        </label>
        <textarea
          id="message"
          {...register('message')}
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring h-32"
        />
        {errors.message && (
          <p className="text-red-500 text-sm mt-1">
            {errors.message.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        {isSubmitting ? 'Sending…' : 'Send Message'}
      </button>
    </motion.form>
  );
}
