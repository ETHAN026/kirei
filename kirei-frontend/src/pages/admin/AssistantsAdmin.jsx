import { useEffect, useState } from 'react';
import {
  adminGetAssistants,
  adminCreateAssistant,
  adminUpdateAssistant,
  adminDeleteAssistant,
} from '../../api/admin';
import Loader from '../../components/Loader';
import { ErrorMessage } from '../../components/Messages';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUser } from 'react-icons/fi';

const EMPTY_FORM = { nom: '', prenom: '', email: '', telephone: '', password: '', actif: true };

export default function AssistantsAdmin() {
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setAssistants(await adminGetAssistants());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(a) {
    setEditingId(a.id);
    setForm({ nom: a.nom, prenom: a.prenom, email: a.email, telephone: a.telephone || '', password: '', actif: a.actif });
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editingId) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await adminUpdateAssistant(editingId, payload);
      } else {
        await adminCreateAssistant(form);
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
    if (!confirm('Supprimer définitivement cet assistant ?')) return;
    try {
      await adminDeleteAssistant(id);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Suppression impossible.');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-black uppercase tracking-tight text-white">Assistants</h1>
        <button onClick={openCreate} className="btn-primary">
          <FiPlus /> Ajouter un assistant
        </button>
      </div>
      <p className="mt-1 text-cream/45">
        Chaque assistant a ses propres identifiants pour se connecter à son espace et voir ses rendez-vous.
      </p>

      <div className="mt-4"><ErrorMessage>{error}</ErrorMessage></div>

      {loading ? (
        <Loader />
      ) : assistants.length === 0 ? (
        <p className="mt-10 text-cream/50">Aucun assistant pour le moment.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line bg-white/[0.02] text-xs uppercase font-black uppercase tracking-tight text-white/40">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assistants.map((a) => (
                <tr key={a.id} className="border-b border-line/60 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-500/15 text-gold-400">
                        <FiUser size={14} />
                      </span>
                      <span className="font-medium text-cream">{a.prenom} {a.nom}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-cream/55">
                    <p>{a.email}</p>
                    {a.telephone && <p className="text-xs text-cream/40">{a.telephone}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${a.actif ? 'bg-sage-500/15 text-sage-500' : 'bg-cream/10 text-cream/50'}`}>
                      {a.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(a)} className="btn-secondary !py-1.5 !px-3 text-xs">
                        <FiEdit2 size={13} /> Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="flex items-center gap-1 rounded-full border border-clay-500/40 px-3 py-1.5 text-xs font-medium text-clay-500 hover:bg-clay-500/10"
                      >
                        <FiTrash2 size={13} /> Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-surface p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-black uppercase tracking-tight text-white">
                {editingId ? "Modifier l'assistant" : 'Nouvel assistant'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-cream/40 hover:text-cream"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Prénom</label>
                  <input required className="input" value={form.prenom}
                    onChange={(e) => setForm({ ...form, prenom: e.target.value })} />
                </div>
                <div>
                  <label className="label">Nom</label>
                  <input required className="input" value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">E-mail (identifiant de connexion)</label>
                <input required type="email" className="input" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="label">Téléphone (optionnel)</label>
                <input className="input" value={form.telephone}
                  onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
              </div>
              <div>
                <label className="label">
                  {editingId ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'}
                </label>
                <input
                  type="password"
                  required={!editingId}
                  minLength={8}
                  className="input"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
              {editingId && (
                <label className="flex items-center gap-2 text-sm text-cream/70">
                  <input type="checkbox" checked={form.actif}
                    onChange={(e) => setForm({ ...form, actif: e.target.checked })} />
                  Compte actif (peut se connecter et être assigné à des RDV)
                </label>
              )}

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