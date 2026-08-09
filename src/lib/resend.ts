// lib/resend.ts
import { Resend } from 'resend';
import { escapeHtml, type ContactFormData } from './contact';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactEmail({ name, email, message }: ContactFormData) {
  try {
    const data = await resend.emails.send({
      from: 'Edward Song <noreply@edsong.xyz>',
      to: 'edwardsong08@gmail.com',
      replyTo: email,
      subject: `New portfolio message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `<p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Message:</strong><br>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send contact email', error);
    return { success: false, error };
  }
}
