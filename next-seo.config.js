const siteUrl = 'https://www.edsong.xyz';

const defaultSeo = {
  defaultTitle: 'Edward Song — Product Engineer & Technical Lead',
  titleTemplate: '%s | Edward Song',
  canonical: siteUrl,
  description:
    'Edward Song is a Product Engineer, Technical Lead, and Volunteer CTO who creates digital products, sets technical direction, and leads multidisciplinary technology teams.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    site_name: 'Edward Song',
    images: [
      {
        url: `${siteUrl}/og/edward-song-zen.png`,
        width: 1200,
        height: 630,
        alt: 'Edward Song — Product Engineer and Technical Lead',
      },
    ],
    description:
      'Product strategy, engineering, and technical leadership across TROA, ClaimChain, and Ryu Legal.',
  },
  twitter: {
    cardType: 'summary_large_image',
  },
  additionalMetaTags: [
    { name: 'theme-color', content: '#f6f7f4' },
  ],
};

export default defaultSeo;
