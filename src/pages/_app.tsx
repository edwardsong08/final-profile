// src/pages/_app.tsx
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { DefaultSeo } from 'next-seo';
import SEO from '../../next-seo.config';
import Layout from '../components/Layout';
import { ThemeProvider } from 'next-themes';
import { EmailCopyProvider } from '../components/EmailCopyProvider';
import { Instrument_Sans } from 'next/font/google';

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  display: 'swap',
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      <div className={instrumentSans.className}>
        <EmailCopyProvider>
          <DefaultSeo {...SEO} />
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </EmailCopyProvider>
      </div>
    </ThemeProvider>
  );
}
