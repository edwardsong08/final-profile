import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ClaimChainEvidence, SitePagePreview, TroaEvidence } from './ProjectEvidence';
import CaseStudyZen from './CaseStudyZen';

describe('homepage page previews', () => {
  it('offers an anchored ClaimChain demo without removing its workflow diagram', () => {
    const html = renderToStaticMarkup(createElement(CaseStudyZen, { project: 'claimchain' }));
    expect(html).toContain('id="demo"');
    expect(html).toContain('href="#demo"');
    expect(html).toContain('ClaimChain workflow');
    expect(html.match(/<video\b/g)).toHaveLength(1);
  });

  it('loads the ClaimChain video only on request, with a poster and direct-file fallback', () => {
    const html = renderToStaticMarkup(createElement(ClaimChainEvidence));
    expect(html).toContain('preload="none"');
    expect(html).toContain('claimchain-demo-poster.webp');
    expect(html).toContain('src="/ClaimChain_Demo.mp4"');
    expect(html).not.toContain('autoPlay');
  });
  it('renders only the approved V3 page, with no nested site carousel', () => {
    const html = renderToStaticMarkup(createElement(SitePagePreview, { project: 'troa' }));

    expect(html.match(/<img\b/g)).toHaveLength(1);
    expect(html).toContain('v3-home-full.webp');
    expect(html).toContain('data-page-preview-scroll');
    expect(html).toContain('tabindex="0"');
    expect(html).not.toContain('careers-home-full');
    expect(html).not.toContain('tickets-home-full');
    expect(html).not.toContain('TROA ecosystem previews');
    expect(html).not.toContain('troaDragSurface');
  });

  it('uses the same single-scrollport structure for Ryu and its full-page asset', () => {
    const html = renderToStaticMarkup(createElement(SitePagePreview, { project: 'ryu-legal' }));

    expect(html.match(/<img\b/g)).toHaveLength(1);
    expect(html.match(/data-page-preview-scroll/g)).toHaveLength(1);
    expect(html).toContain('ryu-home-full.webp');
    expect(html).toContain('height="4386"');
    expect(html).not.toContain('interactiveCaption');
  });

  it('retains the original ecosystem carousel for the separate TROA case study', () => {
    const html = renderToStaticMarkup(createElement(TroaEvidence));

    expect(html).toContain('TROA ecosystem previews');
    expect(html).toContain('Show next TROA site');
    expect(html).not.toContain('data-page-preview-scroll');
  });

  it.each([
    ['fourme', 'fourme-home-full.webp', 1119, 8254],
    ['newsroom', 'newsroom-home-full.webp', 1424, 3216],
  ] as const)('renders the entire %s landing page in one keyboard-accessible scrollport', (project, asset, width, height) => {
    const html = renderToStaticMarkup(createElement(SitePagePreview, {
      project,
      sizes: '(max-width: 820px) 100vw, 46vw',
    }));

    expect(html.match(/<img\b/g)).toHaveLength(1);
    expect(html.match(/data-page-preview-scroll/g)).toHaveLength(1);
    expect(html).toContain(asset);
    expect(html).toContain(`width="${width}"`);
    expect(html).toContain(`height="${height}"`);
    expect(html).toContain('tabindex="0"');
    expect(html).toContain('sizes="(max-width: 820px) 100vw, 46vw"');
    expect(html).not.toContain('-showcase.jpg');
  });
});
