import * as yup from 'yup';

export const CONTACT_LIMITS = {
  name: 100,
  email: 254,
  message: 5_000,
} as const;

export const contactSchema = yup
  .object({
    name: yup
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(CONTACT_LIMITS.name, `Name must be ${CONTACT_LIMITS.name} characters or fewer`)
      .matches(/^[^\r\n]+$/, 'Name contains invalid characters')
      .required('Name is required'),
    email: yup
      .string()
      .trim()
      .email('Enter a valid email address')
      .max(CONTACT_LIMITS.email, `Email must be ${CONTACT_LIMITS.email} characters or fewer`)
      .required('Email is required'),
    message: yup
      .string()
      .trim()
      .min(10, 'Message must be at least 10 characters')
      .max(CONTACT_LIMITS.message, `Message must be ${CONTACT_LIMITS.message.toLocaleString()} characters or fewer`)
      .required('Message is required'),
    website: yup.string().max(0, 'Invalid submission').default(''),
  })
  .required();

export type ContactFormData = yup.InferType<typeof contactSchema>;

export function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    };

    return entities[character];
  });
}
