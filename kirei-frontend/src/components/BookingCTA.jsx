import { FiArrowUpRight } from 'react-icons/fi';
import MagneticButton from './MagneticButton';

export default function BookingCTA({ to = '/reserver', dark = false, className = '', label = 'Prendre rendez-vous · UltraBarber ·' }) {
  return (
    <MagneticButton
      to={to}
      data-cursor="BOOK"
      aria-label="Prendre rendez-vous"
      className={`book-cta ${dark ? 'dark' : ''} ${className}`}
    >
      <svg viewBox="0 0 100 100" className="rotate" aria-hidden>
        <defs>
          <path id="bookCtaPath" d="M50,50 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0" />
        </defs>
        <text style={{ fontFamily: '"Space Mono", monospace', fontSize: '8px', letterSpacing: '0.3em' }}>
          <textPath href="#bookCtaPath">{label}</textPath>
        </text>
      </svg>
      <span className="cta-arrow">
        <FiArrowUpRight size={30} strokeWidth={1.5} />
      </span>
    </MagneticButton>
  );
}
