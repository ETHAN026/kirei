import { useEffect, useState } from 'react';
import BarberPole from './BarberPole';

export default function Preloader({ exit }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => {
      setCount((c) => (c >= 100 ? 100 : c + 1));
    }, 16);
    return () => clearInterval(iv);
  }, []);

  const word = 'ULTRA BARBER';

  return (
    <div className={`preloader ${exit ? 'exit' : ''}`} aria-hidden>
      <div className="flex items-center gap-5">
        <BarberPole style={{ '--pole-w': '18px', '--pole-h': '42px' }} />
        <div className="flex overflow-hidden font-display text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
          {word.split('').map((ch, i) => (
            <span key={i} className="letter-in" style={{ animationDelay: `${140 + i * 55}ms` }}>
              {ch === ' ' ? '\u00A0' : ch}
            </span>
          ))}
        </div>
      </div>
      <p className="mono-label text-white/40">Luxury barber studio — {count}%</p>
    </div>
  );
}
