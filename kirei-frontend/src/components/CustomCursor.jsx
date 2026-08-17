import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const rootRef = useRef(null);
  const [mode, setMode] = useState('idle');
  const [label, setLabel] = useState('');
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!fine.matches || reduced.matches) return;

    setEnabled(true);
    document.documentElement.classList.add('has-cursor');

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const cur = { ...pos };
    let raf = 0;

    const onMove = (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
    };

    const onOver = (e) => {
      const tagged = e.target.closest('[data-cursor]');
      if (tagged) {
        setLabel(tagged.dataset.cursor);
        setMode('label');
        return;
      }
      setLabel('');
      setMode(e.target.closest('a, button, [role="button"]') ? 'link' : 'idle');
    };

    const loop = () => {
      cur.x += (pos.x - cur.x) * 0.18;
      cur.y += (pos.y - cur.y) * 0.18;
      if (rootRef.current) {
        rootRef.current.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0)`;
      }
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove('has-cursor');
    };
  }, []);

  if (!enabled) return null;

  return (
    <div ref={rootRef} className="cursor-cross" aria-hidden>
      <span
        className={`cursor-cross-inner ${mode === 'link' ? 'is-x' : ''} ${
          mode === 'label' ? 'is-label' : ''
        }`}
      >
        <span className="c-line c-line-v" />
        <span className="c-line c-line-h" />
        <span className="c-dot" />
        <span className="cursor-label">{label}</span>
      </span>
    </div>
  );
}