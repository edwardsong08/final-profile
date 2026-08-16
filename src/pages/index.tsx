import { NextSeo, SocialProfileJsonLd, WebPageJsonLd } from 'next-seo';
import PortfolioZen from '../components/v21/PortfolioZen';

export default function Home() {
  return (
    <>
      <NextSeo
        title="Product Engineer & Technical Lead"
        description="Edward Song is a Product Engineer, Technical Lead, and Volunteer CTO at TROA. He creates digital products, sets technical direction, and leads multidisciplinary technology teams."
        canonical="https://www.edsong.xyz/"
        openGraph={{
          title: 'Edward Song — Product Engineer & Technical Lead',
          description:
            'Product strategy, engineering, and technical leadership across TROA, ClaimChain, and Ryu Legal.',
          url: 'https://www.edsong.xyz/',
          type: 'website',
          images: [
            {
              url: 'https://www.edsong.xyz/og/edward-song-zen.png',
              width: 1200,
              height: 630,
              alt: 'Edward Song — Product Engineer and Technical Lead',
            },
          ],
        }}
        additionalMetaTags={[{ name: 'theme-color', content: '#f6f7f4' }]}
      />
      <WebPageJsonLd
        id="https://www.edsong.xyz/#webpage"
        url="https://www.edsong.xyz/"
        title="Edward Song — Product Engineer & Technical Lead"
        description="Edward Song creates digital products, sets technical direction, and leads multidisciplinary technology teams at TROA."
      />
      <SocialProfileJsonLd
        type="Person"
        name="Edward Song"
        url="https://www.edsong.xyz/"
        sameAs={[
          'https://www.linkedin.com/in/edward-y-song',
          'https://github.com/edwardsong08',
        ]}
      />
      <PortfolioZen />
    </>
  );
}
