import { BreadcrumbJsonLd, NextSeo, WebPageJsonLd } from 'next-seo';

import CaseStudyZen from '../../components/v21/CaseStudyZen';

export default function HubCaseStudy() {
  const description =
    'How Edward Song designed an interactive systems map that separates hierarchy, relationships, lifecycle, visibility, and operational status.';

  return (
    <>
      <NextSeo
        title="ES/HUB Systems Mapping Case Study"
        description={description}
        canonical="https://edsong.xyz/work/hub"
        openGraph={{
          url: 'https://edsong.xyz/work/hub',
          title: 'ES/HUB Systems Mapping Case Study | Edward Song',
          description,
        }}
      />
      <BreadcrumbJsonLd
        itemListElements={[
          { position: 1, name: 'Home', item: 'https://edsong.xyz/' },
          { position: 2, name: 'ES/HUB case study', item: 'https://edsong.xyz/work/hub' },
        ]}
      />
      <WebPageJsonLd
        id="https://edsong.xyz/work/hub#webpage"
        description={description}
      />
      <CaseStudyZen project="hub" />
    </>
  );
}
