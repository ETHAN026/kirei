import RevealLines from './RevealLines';

export default function SectionHeading({ index, label, lines, className = '', dark = false }) {
  const color = dark ? 'text-white' : 'text-night';
  const labelColor = dark ? 'text-white/50' : 'text-night/50';

  return (
    <div className={className}>
      <p className={`mono-label flex items-baseline gap-4 ${labelColor}`}>
        <span className={`inline-block h-px w-10 self-center bg-current opacity-50`} />
        {label}
        <span className={`text-[9px] ${dark ? 'text-white/25' : 'text-night/25'}`}>
          / {index}
        </span>
      </p>
      <h2
        className={`mt-5 font-display font-black uppercase leading-[0.88] tracking-tight text-[clamp(1.4rem,3.2vw,2.6rem)] ${color}`}
      >
        <RevealLines text={lines} delay={80} />
      </h2>
    </div>
  );
}
