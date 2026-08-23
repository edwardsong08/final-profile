import { BreadcrumbJsonLd, NextSeo, WebPageJsonLd } from 'next-seo';

import CaseStudyZen from '../../components/v21/CaseStudyZen';

export default function RyuLegalCaseStudy() {
  const description =
    'Long-term product stewardship for Ryu Legal’s live NJ/NY website, spanning information architecture, interface design, engineering, search visibility, deployment, and maintenance.';

  return (
    <>
      <NextSeo
        title="Ryu Legal Product Stewardship Case Study"
        description={description}
        canonical="https://www.edsong.xyz/work/ryu-legal"
        openGraph={{
          title: 'Ryu Legal Product Stewardship Case Study — Edward Song',
          description,
          type: 'article',
          url: 'https://www.edsong.xyz/work/ryu-legal',
        }}
      />
      <WebPageJsonLd
        id="https://www.edsong.xyz/work/ryu-legal#webpage"
        url="https://www.edsong.xyz/work/ryu-legal"
        name="Ryu Legal Product Stewardship Case Study — Edward Song"
        description={description}
      />
      <BreadcrumbJsonLd itemListElements={[
        { position: 1, name: 'Edward Song', item: 'https://www.edsong.xyz/' },
        { position: 2, name: 'Selected work', item: 'https://www.edsong.xyz/#work' },
        { position: 3, name: 'Ryu Legal case study', item: 'https://www.edsong.xyz/work/ryu-legal' },
      ]} />
      <CaseStudyZen project="ryu-legal" />
    </>
  );
}
