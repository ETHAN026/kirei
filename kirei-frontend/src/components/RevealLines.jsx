import { useEffect, useRef, useState } from 'react';

export default function RevealLines({ text, className = '', lineClassName = '', delay = 0, step = 90 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const lines = String(text).split('\n');

  return (
    <span ref={ref} className={`reveal-lines ${visible ? 'is-visible' : ''} ${className}`}>
      {lines.map((l, i) => (
        <span
          key={i}
          className={`reveal-line ${lineClassName}`}
          style={{ transitionDelay: `${delay + i * step}ms` }}
        >
          <span>{l || '\u00A0'}</span>
        </span>
      ))}
    </span>
  );
}
