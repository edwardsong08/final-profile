import { NextSeo, SocialProfileJsonLd, WebPageJsonLd } from 'next-seo';
import PortfolioZen from '../components/v21/PortfolioZen';

export default function Home() {
  return (
    <>
      <NextSeo
        title="Product Engineer & Technical Lead"
        description="Edward Song is a Product Engineer, Technical Lead, and Volunteer CTO working across product direction, hands-on engineering, and multidisciplinary technology leadership."
        canonical="https://www.edsong.xyz/"
        openGraph={{
          title: 'Edward Song — Product Engineer & Technical Lead',
          description:
            'Product direction, hands-on engineering, and technical leadership across TROA, ClaimChain, and Ryu Legal.',
          url: 'https://www.edsong.xyz/',
          type: 'website',
          images: [
            {
              url: 'https://www.edsong.xyz/og/edward-song-zen.png',
              width: 1199,
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
        name="Edward Song — Product Engineer and Technical Lead"
        description="Edward Song works across product direction, hands-on engineering, and multidisciplinary technology leadership."
        mainEntity={{ '@id': 'https://www.edsong.xyz/#person' }}
      />
      <SocialProfileJsonLd
        type="Person"
        id="https://www.edsong.xyz/#person"
        name="Edward Song"
        url="https://www.edsong.xyz/"
        image="https://www.edsong.xyz/og/edward-song-zen.png"
        jobTitle="Product Engineer and Technical Lead"
        description="Product Engineer, Technical Lead, and Volunteer CTO working across product direction, hands-on engineering, and multidisciplinary technology leadership."
        knowsLanguage={['English', 'Korean']}
        sameAs={[
          'https://www.linkedin.com/in/edward-y-song',
          'https://github.com/edwardsong08',
        ]}
      />
      <PortfolioZen />
    </>
  );
}
