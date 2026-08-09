const siteUrl = 'https://www.edsong.xyz';

const defaultSeo = {
  defaultTitle: 'Edward Song | Full-Stack Engineer',
  titleTemplate: '%s | Edward Song',
  canonical: siteUrl,
  description:
    'Full-stack engineer building production systems across React, Next.js, Java, Spring Boot, Go, AWS, and applied AI.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    site_name: 'Edward Song',
    images: [
      {
        url: `${siteUrl}/lighthero.webp`,
        width: 1536,
        height: 1024,
        alt: 'Edward Song portfolio landscape',
      },
    ],
    description:
      'Portfolio featuring ClaimChain, TROA platform work, and production-focused engineering projects.',
  },
  twitter: {
    cardType: 'summary_large_image',
  },
  additionalMetaTags: [
    { name: 'theme-color', content: '#000000' },
  ],
};

export default defaultSeo;
