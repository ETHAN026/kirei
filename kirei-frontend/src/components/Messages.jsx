export function ErrorMessage({ children }) {
  if (!children) return null;
  return (
    <div className="rounded-xl border border-clay-500/25 bg-clay-500/5 px-4 py-3 text-sm text-clay-600">
      {children}
    </div>
  );
}

export function SuccessMessage({ children }) {
  if (!children) return null;
  return (
    <div className="rounded-xl border border-sage-500/25 bg-sage-500/5 px-4 py-3 text-sm text-sage-600">
      {children}
    </div>
  );
}
