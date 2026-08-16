import { BreadcrumbJsonLd, NextSeo, WebPageJsonLd } from 'next-seo';

import CaseStudyZen from '../../components/v21/CaseStudyZen';

export default function ClaimChainCaseStudy() {
  const description =
    'An independent three-role prototype with backend-enforced lifecycle, payment, and export controls, plus advisory-only ML.';

  return (
    <>
      <NextSeo
        title="ClaimChain Product Engineering Case Study"
        description={description}
        canonical="https://www.edsong.xyz/work/claimchain"
        openGraph={{
          title: 'ClaimChain Product Engineering Case Study — Edward Song',
          description,
          type: 'article',
          url: 'https://www.edsong.xyz/work/claimchain',
        }}
      />
      <WebPageJsonLd
        id="https://www.edsong.xyz/work/claimchain#webpage"
        url="https://www.edsong.xyz/work/claimchain"
        title="ClaimChain Product Engineering Case Study — Edward Song"
        description={description}
      />
      <BreadcrumbJsonLd itemListElements={[
        { position: 1, name: 'Edward Song', item: 'https://www.edsong.xyz/' },
        { position: 2, name: 'Selected work', item: 'https://www.edsong.xyz/#work' },
        { position: 3, name: 'ClaimChain case study', item: 'https://www.edsong.xyz/work/claimchain' },
      ]} />
      <CaseStudyZen project="claimchain" />
    </>
  );
}
