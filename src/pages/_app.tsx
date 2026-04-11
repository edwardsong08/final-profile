// src/pages/_app.tsx
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { DefaultSeo } from 'next-seo';
import SEO from '../../next-seo.config';
import Layout from '../components/Layout';
import { ThemeProvider } from 'next-themes';
import ThemeHydrated from '../components/ThemeHydrated';
import { EmailCopyProvider } from '../components/EmailCopyProvider';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <ThemeHydrated>
        <EmailCopyProvider>
          <DefaultSeo {...SEO} />
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </EmailCopyProvider>
      </ThemeHydrated>
    </ThemeProvider>
  );
}
