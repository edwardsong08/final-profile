import { describe, expect, it } from 'vitest';
import { contactSchema, escapeHtml } from './contact';

describe('contactSchema', () => {
  it('normalizes a valid submission', async () => {
    await expect(
      contactSchema.validate({
        name: '  Ada Lovelace  ',
        email: '  ada@example.com  ',
        message: '  I would like to discuss an engineering role.  ',
        website: '',
      })
    ).resolves.toEqual({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      message: 'I would like to discuss an engineering role.',
      website: '',
    });
  });

  it('normalizes a populated honeypot so the endpoint can answer silently', async () => {
    await expect(
      contactSchema.validate({
        name: 'Automated Submission',
        email: 'bot@example.com',
        message: 'This message should not be delivered.',
        website: 'https://spam.example',
      })
    ).resolves.toMatchObject({ website: 'https://spam.example' });
  });

  it('rejects invalid contact fields', async () => {
    await expect(
      contactSchema.validate({
        name: 'A\r\nB',
        email: 'not-an-email',
        message: 'short',
        website: '',
      })
    ).rejects.toThrow();
  });
});

describe('escapeHtml', () => {
  it('escapes visitor content before it is placed in an email', () => {
    expect(escapeHtml(`<img src=x onerror="alert('xss')"> &`)).toBe(
      '&lt;img src=x onerror=&quot;alert(&#39;xss&#39;)&quot;&gt; &amp;'
    );
  });
});
