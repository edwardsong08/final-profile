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
        canonical="https://profile.edsong.xyz/work/troa"
        openGraph={{
          title: 'TROA Technology Leadership Case Study — Edward Song',
          description,
          type: 'article',
          url: 'https://profile.edsong.xyz/work/troa',
        }}
      />
      <WebPageJsonLd
        id="https://profile.edsong.xyz/work/troa#webpage"
        url="https://profile.edsong.xyz/work/troa"
        name="TROA Technology Leadership Case Study — Edward Song"
        description={description}
      />
      <BreadcrumbJsonLd itemListElements={[
        { position: 1, name: 'Edward Song', item: 'https://profile.edsong.xyz/' },
        { position: 2, name: 'Selected work', item: 'https://profile.edsong.xyz/#work' },
        { position: 3, name: 'TROA case study', item: 'https://profile.edsong.xyz/work/troa' },
      ]} />
      <CaseStudyZen project="troa" />
    </>
  );
}
