export default function BarberPole({ vertical = true, className = '', style = {} }) {
  return (
    <div className={`barber-pole ${vertical ? 'pole-v' : 'pole-h'} ${className}`} style={style} aria-hidden>
      <span className="pole-cap cap-top" />
      <span className="pole-cap cap-bottom" />
    </div>
  );
}