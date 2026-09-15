import { NextSeo, SocialProfileJsonLd, WebPageJsonLd } from 'next-seo';
import PortfolioZen from '../components/v21/PortfolioZen';

export default function Home() {
  return (
    <>
      <NextSeo
        title="CTO | Technical Lead | Product Engineer"
        description="Edward Song is a hands-on CTO, technical lead, and product engineer building secure software platforms and operating systems for organizations with complex needs."
        canonical="https://www.edsong.xyz/"
        openGraph={{
          title: 'Edward Song — CTO, Technical Lead, Product Engineer',
          description:
            'Technology ownership across TROA and Ryu Legal, with the systems and infrastructure connecting the work.',
          url: 'https://www.edsong.xyz/',
          type: 'website',
          images: [
            {
              url: 'https://www.edsong.xyz/og/edward-song-zen.png',
              width: 1199,
              height: 630,
              alt: 'Edward Song — CTO, Technical Lead, and Product Engineer',
            },
          ],
        }}
        additionalMetaTags={[{ name: 'theme-color', content: '#f6f7f4' }]}
      />
      <WebPageJsonLd
        id="https://www.edsong.xyz/#webpage"
        url="https://www.edsong.xyz/"
        name="Edward Song — CTO, Technical Lead, and Product Engineer"
        description="Edward Song builds secure software platforms and leads technology across product, engineering, infrastructure, and operations."
        mainEntity={{ '@id': 'https://www.edsong.xyz/#person' }}
      />
      <SocialProfileJsonLd
        type="Person"
        id="https://www.edsong.xyz/#person"
        name="Edward Song"
        url="https://www.edsong.xyz/"
        image="https://www.edsong.xyz/og/edward-song-zen.png"
        jobTitle="CTO, Technical Lead, and Product Engineer"
        description="Hands-on CTO, technical lead, and product engineer working across product direction, software, infrastructure, security, and operations."
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
