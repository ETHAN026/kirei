import { useEffect, useState } from 'react';
import { adminGetCoupes, adminCreateCoupe, adminUpdateCoupe, adminDeleteCoupe } from '../../api/admin';
import Loader from '../../components/Loader';
import { ErrorMessage } from '../../components/Messages';

const EMPTY_FORM = { nom: '', description: '', prixFcfa: '', actif: true };

export default function CoupesAdmin() {
  const [coupes, setCoupes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setCoupes(await adminGetCoupes());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFiles([]);
    setShowForm(true);
  }

  function openEdit(c) {
    setEditingId(c.id);
    setForm({ nom: c.nom, description: c.description || '', prixFcfa: c.prixFcfa, actif: c.actif });
    setFiles([]);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('nom', form.nom);
      formData.append('description', form.description);
      formData.append('prixFcfa', form.prixFcfa);
      formData.append('actif', form.actif);
      files.forEach((f) => formData.append('photos', f));

      if (editingId) {
        await adminUpdateCoupe(editingId, formData);
      } else {
        await adminCreateCoupe(formData);
      }
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Enregistrement impossible.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer définitivement cette coupe ?')) return;
    try {
      await adminDeleteCoupe(id);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Suppression impossible.');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-ink">Coupes &amp; prestations</h1>
        <button onClick={openCreate} className="btn-primary">+ Ajouter une coupe</button>
      </div>

      <div className="mt-4"><ErrorMessage>{error}</ErrorMessage></div>

      {loading ? (
        <Loader />
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {coupes.map((c) => (
            <div key={c.id} className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
              <div className="grid grid-cols-3 gap-px bg-ink/10">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="aspect-square bg-plum-50">
                    {c.photos?.[i] && <img src={c.photos[i]} alt="" className="h-full w-full object-cover" />}
                  </div>
                ))}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <p className="font-display text-lg text-ink">{c.nom}</p>
                  {!c.actif && <span className="badge bg-ink/10 text-ink/50">Inactif</span>}
                </div>
                <p className="mt-1 text-sm font-medium text-plum-600">{c.prixFcfa} FCFA</p>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => openEdit(c)} className="btn-secondary flex-1 !py-1.5 !px-3 text-xs">
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="flex-1 rounded-full border border-clay-500/30 px-3 py-1.5 text-xs font-medium text-clay-600 hover:bg-clay-500/5"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6">
            <h2 className="font-display text-2xl text-ink">{editingId ? 'Modifier la coupe' : 'Nouvelle coupe'}</h2>
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="label">Nom</label>
                <input required className="input" value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })} />
              </div>
              <div>
                <label className="label">Description (optionnel)</label>
                <textarea className="input" rows={3} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="label">Prix (FCFA)</label>
                <input required type="number" min="0" className="input" value={form.prixFcfa}
                  onChange={(e) => setForm({ ...form, prixFcfa: e.target.value })} />
              </div>
              <div>
                <label className="label">Photos (jusqu'à 3, {editingId ? 'remplace les existantes si sélectionnées' : 'obligatoire'})</label>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  multiple
                  onChange={(e) => setFiles(Array.from(e.target.files).slice(0, 3))}
                  className="input"
                />
                {files.length > 0 && <p className="mt-1 text-xs text-ink/45">{files.length} fichier(s) sélectionné(s)</p>}
              </div>
              <label className="flex items-center gap-2 text-sm text-ink/70">
                <input type="checkbox" checked={form.actif}
                  onChange={(e) => setForm({ ...form, actif: e.target.checked })} />
                Visible dans le catalogue client
              </label>

              <ErrorMessage>{error}</ErrorMessage>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">
                  Annuler
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
