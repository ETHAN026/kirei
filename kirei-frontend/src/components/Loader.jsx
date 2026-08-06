export default function Loader({ label = 'Chargement…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink/50">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-plum-200 border-t-plum-600" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
