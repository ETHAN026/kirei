import { useRef } from 'react';
import { Link } from 'react-router-dom';

export default function MagneticButton({ to = null, className = '', strength = 0.28, children, ...rest }) {
  const ref = useRef(null);

  const handlers = {
    onMouseMove: (e) => {
      const el = ref.current;
      if (!el || e.pointerType === 'touch') return;
      const r = el.getBoundingClientRect();
      el.style.transform = `translate3d(${(e.clientX - (r.left + r.width / 2)) * strength}px, ${
        (e.clientY - (r.top + r.height / 2)) * strength
      }px, 0)`;
    },
    onMouseLeave: () => {
      if (ref.current) ref.current.style.transform = '';
    },
  };

  const cls = `${className} transition-transform duration-300 ease-out will-change-transform`;

  if (to) {
    return (
      <Link to={to} ref={ref} {...handlers} {...rest} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button ref={ref} {...handlers} {...rest} className={cls}>
      {children}
    </button>
  );
}
