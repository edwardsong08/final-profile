// pages/api/contact.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { sendContactEmail } from '../../../src/lib/resend';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Missing fields' });
    }

    const result = await sendContactEmail(name, email, message);

    if (result.success) {
      res.status(200).json({ success: true });
    } else {
      res.status(500).json({ success: false, error: 'Failed to send email' });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
