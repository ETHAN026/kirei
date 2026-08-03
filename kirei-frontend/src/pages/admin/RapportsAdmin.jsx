import { useState } from 'react';
import { API_BASE } from '../../api/client';

export default function RapportsAdmin() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  function download(format) {
    const token = localStorage.getItem('kirei_admin_token');
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);

    // On passe par un fetch pour transmettre le header Authorization,
    // puis on déclenche le téléchargement du blob reçu.
    fetch(`${API_BASE}/api/admin/rapports/${format}?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rapport-financier.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Rapports financiers</h1>
      <p className="mt-1 text-ink/50">
        Export des rendez-vous terminés (payés) sur la période sélectionnée.
      </p>

      <div className="card mt-6 max-w-xl">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Du</label>
            <input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="label">Au</label>
            <input type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
        <p className="mt-2 text-xs text-ink/40">Laissez vide pour couvrir toute la période disponible.</p>

        <div className="mt-6 flex gap-3">
          <button onClick={() => download('pdf')} className="btn-primary flex-1">
            Télécharger en PDF
          </button>
          <button onClick={() => download('excel')} className="btn-secondary flex-1">
            Télécharger en Excel
          </button>
        </div>
      </div>
    </div>
  );
}
