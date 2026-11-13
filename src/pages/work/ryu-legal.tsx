import { BreadcrumbJsonLd, NextSeo, WebPageJsonLd } from 'next-seo';

import CaseStudyZen from '../../components/v21/CaseStudyZen';

export default function RyuLegalCaseStudy() {
  const description =
    'Long-term technology ownership for Ryu Legal spanning measurable website growth, custom software, infrastructure, security, performance, and operations.';

  return (
    <>
      <NextSeo
        title="Ryu Legal Technical Leadership Case Study"
        description={description}
        canonical="https://profile.edsong.xyz/work/ryu-legal"
        openGraph={{
          title: 'Ryu Legal Product Stewardship Case Study — Edward Song',
          description,
          type: 'article',
          url: 'https://profile.edsong.xyz/work/ryu-legal',
        }}
      />
      <WebPageJsonLd
        id="https://profile.edsong.xyz/work/ryu-legal#webpage"
        url="https://profile.edsong.xyz/work/ryu-legal"
        name="Ryu Legal Product Stewardship Case Study — Edward Song"
        description={description}
      />
      <BreadcrumbJsonLd itemListElements={[
        { position: 1, name: 'Edward Song', item: 'https://profile.edsong.xyz/' },
        { position: 2, name: 'Selected work', item: 'https://profile.edsong.xyz/#work' },
        { position: 3, name: 'Ryu Legal case study', item: 'https://profile.edsong.xyz/work/ryu-legal' },
      ]} />
      <CaseStudyZen project="ryu-legal" />
    </>
  );
}
