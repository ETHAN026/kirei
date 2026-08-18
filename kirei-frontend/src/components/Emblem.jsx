function Scissor() {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-full w-full"
    >
      <path d="M33.5 30.5 12.5 9.5" strokeWidth="3.5" />
      <path d="M30.5 33.5 9.5 12.5" strokeWidth="3.5" />
      <path d="M32 32 41.5 41.5 51.5 51.5" strokeWidth="3.5" />
      <circle cx="41.5" cy="41.5" r="7" strokeWidth="4" />
      <circle cx="51.5" cy="51.5" r="5" strokeWidth="4" />
      <circle cx="32" cy="32" r="3.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Deux paires de ciseaux fermés croisées en X — emblème signature. */
export default function Emblem({ className = '', size = 80 }) {
  return (
    <span
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span className="absolute inset-0 rotate-45">
        <Scissor />
      </span>
      <span className="absolute inset-0 -rotate-45">
        <Scissor />
      </span>
    </span>
  );
}