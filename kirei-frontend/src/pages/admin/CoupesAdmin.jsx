import { useEffect, useState } from 'react';
import {
  adminGetCoupes,
  adminCreateCoupe,
  adminUpdateCoupe,
  adminDeleteCoupe,
} from '../../api/admin';
import Loader from '../../components/Loader';
import { ErrorMessage } from '../../components/Messages';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiHome } from 'react-icons/fi';

const EMPTY_FORM = { nom: '', description: '', prixFcfa: '', actif: true, domicileDisponible: false, prixDomicileFcfa: '' };

export default function CoupesAdmin() {
  const [coupes, setCoupes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
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
    setShowForm(true);
  }

  function openEdit(c) {
    setEditingId(c.id);
    setForm({
      nom: c.nom,
      description: c.description || '',
      prixFcfa: c.prixFcfa,
      actif: c.actif,
      domicileDisponible: c.domicileDisponible,
      prixDomicileFcfa: c.prixDomicileFcfa ?? '',
    });
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        nom: form.nom,
        description: form.description,
        prixFcfa: Number(form.prixFcfa),
        actif: form.actif,
        domicileDisponible: form.domicileDisponible,
        prixDomicileFcfa: form.domicileDisponible ? Number(form.prixDomicileFcfa) : '',
      };
      if (editingId) {
        await adminUpdateCoupe(editingId, payload);
      } else {
        await adminCreateCoupe(payload);
        setShowForm(false);
        await load();
        return;
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
    if (!confirm('Supprimer définitivement cette coupe et ses photos ?')) return;
    try {
      await adminDeleteCoupe(id);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Suppression impossible.');
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-xl font-black uppercase tracking-tight text-white sm:text-2xl">Coupes &amp; prestations</h1>
        <button onClick={openCreate} className="btn-primary self-start sm:self-auto">
          <FiPlus /> Ajouter une coupe
        </button>
      </div>

      <div className="mt-4"><ErrorMessage>{error}</ErrorMessage></div>

      {loading ? (
        <Loader />
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {coupes.map((c) => (
            <div key={c.id} className="overflow-hidden rounded-2xl border border-line bg-surface p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-xl font-black uppercase tracking-tight text-white">{c.nom}</p>
                {!c.actif && <span className="badge bg-cream/10 text-cream/50">Inactif</span>}
              </div>
              <p className="mt-1 text-sm font-semibold text-gold-400">{c.prixFcfa} FCFA</p>
              {c.description && <p className="mt-1 text-xs text-cream/50">{c.description}</p>}
              {c.domicileDisponible && (
                <p className="mt-1 flex items-center gap-1 text-xs text-gold-300">
                  <FiHome size={12} /> Domicile : {c.prixDomicileFcfa} FCFA
                </p>
              )}

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button onClick={() => openEdit(c)} className="btn-secondary !py-1.5 !px-2 text-xs">
                  <FiEdit2 size={13} /> Modifier
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="flex items-center justify-center gap-1 rounded-full border border-clay-500/40 px-2 py-1.5 text-xs font-medium text-clay-500 hover:bg-clay-500/10"
                >
                  <FiTrash2 size={13} /> Suppr.
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal : formulaire infos coupe */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm sm:px-6">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-surface p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-black uppercase tracking-tight text-white">
                {editingId ? 'Modifier la coupe' : 'Nouvelle coupe'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-cream/40 hover:text-cream"><FiX size={20} /></button>
            </div>
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
                <label className="label">Prix au salon (FCFA)</label>
                <input required type="number" min="0" className="input" value={form.prixFcfa}
                  onChange={(e) => setForm({ ...form, prixFcfa: e.target.value })} />
              </div>

              <div className="rounded-xl border border-line bg-raised/50 p-4">
                <label className="flex items-center gap-2 text-sm font-medium text-cream">
                  <input type="checkbox" checked={form.domicileDisponible}
                    onChange={(e) => setForm({ ...form, domicileDisponible: e.target.checked })} />
                  Proposer cette coupe à domicile
                </label>
                {form.domicileDisponible && (
                  <div className="mt-3">
                    <label className="label">Prix à domicile pour cette coupe (FCFA)</label>
                    <input required type="number" min="0" className="input" value={form.prixDomicileFcfa}
                      onChange={(e) => setForm({ ...form, prixDomicileFcfa: e.target.value })} />
                  </div>
                )}
              </div>

              <label className="flex items-center gap-2 text-sm text-cream/70">
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