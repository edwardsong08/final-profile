import { BreadcrumbJsonLd, NextSeo, WebPageJsonLd } from 'next-seo';

import CaseStudyZen from '../../components/v21/CaseStudyZen';

export default function TroaCaseStudy() {
  const description =
    'How Edward Song grew from software engineer to CTO while building and operating TROA’s products, infrastructure, teams, and technology practices.';

  return (
    <>
      <NextSeo
        title="TROA CTO and Technology Leadership Case Study"
        description={description}
        canonical="https://www.edsong.xyz/work/troa"
        openGraph={{
          title: 'TROA Technology Leadership Case Study — Edward Song',
          description,
          type: 'article',
          url: 'https://www.edsong.xyz/work/troa',
        }}
      />
      <WebPageJsonLd
        id="https://www.edsong.xyz/work/troa#webpage"
        url="https://www.edsong.xyz/work/troa"
        name="TROA Technology Leadership Case Study — Edward Song"
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
