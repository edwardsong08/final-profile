import { useEffect, useRef, useState } from 'react';
import styles from './PortfolioZen.module.css';

export default function FluidHero() {
  const layer = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [mode, setMode] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const choose = () => {
      setReady(false);
      setMode(reduced.matches ? null : matchMedia('(pointer: coarse)').matches ? 'water' : 'smoke');
    };
    choose(); reduced.addEventListener('change', choose);
    const receive = (event: MessageEvent) => {
      if (event.origin === location.origin && event.source === frame.current?.contentWindow && event.data?.type === 'fluid-ready') setReady(true);
    };
    let pending: { x: number; y: number; time: number } | null = null;
    let raf = 0;
    const send = () => {
      raf = 0;
      if (pending) frame.current?.contentWindow?.postMessage({ type: 'fluid-pointer', ...pending }, location.origin);
      pending = null;
    };
    const move = (event: PointerEvent) => {
      if (event.target instanceof Element && event.target.closest('a,button,input,textarea,select')) return;
      const box = layer.current?.getBoundingClientRect();
      if (!box || event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) return;
      pending = { x: (event.clientX - box.left) / box.width, y: (event.clientY - box.top) / box.height, time: performance.now() };
      if (!raf) raf = requestAnimationFrame(send);
    };
    const observer = new IntersectionObserver(([entry]) => {
      frame.current?.contentWindow?.postMessage({type:'fluid-visible',visible:entry.isIntersecting},location.origin);
    });
    if (layer.current) observer.observe(layer.current);
    window.addEventListener('message', receive);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', move, { passive: true });
    return () => {
      cancelAnimationFrame(raf); observer.disconnect(); reduced.removeEventListener('change', choose);
      window.removeEventListener('message', receive); window.removeEventListener('pointermove', move); window.removeEventListener('pointerdown', move);
    };
  }, []);
  return <div ref={layer} className={styles.smokeLayer} data-mode={ready ? 'pigment' : 'static'}>
    <div className={styles.heroArtworkFallback} aria-hidden="true" />
    {mode && <iframe ref={frame} src={`/fluid-watercolor-study.html?embed&${mode}`} title="Decorative watercolor landscape" aria-hidden="true" tabIndex={-1} className={styles.fluidHeroFrame} style={{opacity:ready ? 1 : 0}} />}
  </div>;
}
