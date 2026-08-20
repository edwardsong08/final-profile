import { BreadcrumbJsonLd, NextSeo, WebPageJsonLd } from 'next-seo';

import CaseStudyZen from '../../components/v21/CaseStudyZen';

export default function TroaCaseStudy() {
  const description =
    'Edward Song’s Volunteer CTO work across board-level technical direction, hands-on product engineering, and leadership of TROA’s multidisciplinary technology team.';

  return (
    <>
      <NextSeo
        title="TROA Product & Technical Leadership Case Study"
        description={description}
        canonical="https://www.edsong.xyz/work/troa"
        openGraph={{
          title: 'TROA Product & Technical Leadership — Edward Song',
          description,
          type: 'article',
          url: 'https://www.edsong.xyz/work/troa',
        }}
      />
      <WebPageJsonLd
        id="https://www.edsong.xyz/work/troa#webpage"
        url="https://www.edsong.xyz/work/troa"
        title="TROA Product & Technical Leadership — Edward Song"
        description={description}
      />
      <BreadcrumbJsonLd itemListElements={[
        { position: 1, name: 'Edward Song', item: 'https://www.edsong.xyz/' },
        { position: 2, name: 'Selected work', item: 'https://www.edsong.xyz/#work' },
        { position: 3, name: 'TROA case study', item: 'https://www.edsong.xyz/work/troa' },
      ]} />
      <CaseStudyZen project="troa" />
    </>
  );
}
