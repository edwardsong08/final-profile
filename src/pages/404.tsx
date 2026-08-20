import Error from 'next/error';
import { NextSeo } from 'next-seo';

export default function NotFound() {
  return (
    <>
      <NextSeo noindex nofollow />
      <Error statusCode={404} />
    </>
  );
}
