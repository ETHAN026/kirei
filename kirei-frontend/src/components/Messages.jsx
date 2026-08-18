export function ErrorMessage({ children }) {
  if (!children) return null;
  return (
    <div className="border border-clay-500/40 bg-clay-500/10 px-4 py-3 text-sm text-clay-600">
      {children}
    </div>
  );
}

export function SuccessMessage({ children }) {
  if (!children) return null;
  return (
    <div className="border border-sage-500/40 bg-sage-500/10 px-4 py-3 text-sm text-sage-600">
      {children}
    </div>
  );
}