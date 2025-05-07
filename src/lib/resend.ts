// lib/resend.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactEmail(name: string, email: string, message: string) {
  try {
    const data = await resend.emails.send({
        from: 'Edward Song <noreply@edsong.xyz>',
         to: 'edwardsong08@gmail.com',                         // your personal Gmail
        subject: `New Contact Form Message from ${name}`,
         html: `<p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Message:</strong><br>${message}</p>`,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Resend error:', error);
    return { success: false, error };
  }
}
