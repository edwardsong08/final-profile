// src/pages/_app.tsx
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { DefaultSeo } from 'next-seo';
import SEO from '../../next-seo.config';
import Layout from '../components/Layout';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <DefaultSeo {...SEO} />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}
