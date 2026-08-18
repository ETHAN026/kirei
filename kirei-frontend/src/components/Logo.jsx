import { Link } from 'react-router-dom';
import BarberPole from './BarberPole';

export default function Logo({ to = '/', dark = true, small = false }) {
  return (
    <Link to={to} className="group inline-flex items-center gap-3" aria-label="UltraBarber — accueil">
      <BarberPole
        style={{ '--pole-w': '10px', '--pole-h': '24px' }}
        className="opacity-90 transition-transform duration-500 group-hover:rotate-12"
      />
      <span className={`font-display font-black uppercase tracking-tight leading-none ${small ? 'text-lg' : 'text-xl'}`}>
        <span className={dark ? 'text-night' : 'text-white'}>
          ULTRA<span className="opacity-45">BARBER</span>
        </span>
        <sup className="ml-1 font-mono text-[8px] font-normal tracking-normal opacity-50">®</sup>
      </span>
    </Link>
  );
}
