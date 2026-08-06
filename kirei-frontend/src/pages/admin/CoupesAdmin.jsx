import { useEffect, useRef, useState } from 'react';
import {
  adminGetCoupes,
  adminCreateCoupe,
  adminUpdateCoupe,
  adminDeleteCoupe,
  adminAddCoupePhoto,
  adminDeleteCoupePhoto,
} from '../../api/admin';
import Loader from '../../components/Loader';
import { ErrorMessage } from '../../components/Messages';
import { FiPlus, FiEdit2, FiTrash2, FiImage, FiX, FiHome } from 'react-icons/fi';

const EMPTY_FORM = { nom: '', description: '', prixFcfa: '', actif: true, domicileDisponible: false, prixDomicileFcfa: '' };

export default function CoupesAdmin() {
  const [coupes, setCoupes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [photoManagerCoupe, setPhotoManagerCoupe] = useState(null);

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
        const created = await adminCreateCoupe(payload);
        setShowForm(false);
        await load();
        setPhotoManagerCoupe(created); // enchaîne directement sur l'ajout des photos
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

  async function refreshPhotoManager(coupeId) {
    const updated = await adminGetCoupes();
    setCoupes(updated);
    setPhotoManagerCoupe(updated.find((c) => c.id === coupeId) || null);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-ink">Coupes &amp; prestations</h1>
        <button onClick={openCreate} className="btn-primary">
          <FiPlus /> Ajouter une coupe
        </button>
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
                  <div key={i} className="flex aspect-square items-center justify-center bg-plum-50">
                    {c.photos?.[i] ? (
                      <img src={c.photos[i].url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <FiImage className="text-plum-200" size={20} />
                    )}
                  </div>
                ))}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display text-lg text-ink">{c.nom}</p>
                  {!c.actif && <span className="badge bg-ink/10 text-ink/50">Inactif</span>}
                </div>
                <p className="mt-1 text-sm font-medium text-plum-600">{c.prixFcfa} FCFA</p>
                {c.domicileDisponible && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-gold-600">
                    <FiHome size={12} /> Domicile : {c.prixDomicileFcfa} FCFA
                  </p>
                )}

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <button onClick={() => openEdit(c)} className="btn-secondary !py-1.5 !px-2 text-xs">
                    <FiEdit2 size={13} /> Modifier
                  </button>
                  <button onClick={() => setPhotoManagerCoupe(c)} className="btn-secondary !py-1.5 !px-2 text-xs">
                    <FiImage size={13} /> Photos
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="flex items-center justify-center gap-1 rounded-full border border-clay-500/30 px-2 py-1.5 text-xs font-medium text-clay-600 hover:bg-clay-500/5"
                  >
                    <FiTrash2 size={13} /> Suppr.
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal : formulaire infos coupe */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-ink">{editingId ? 'Modifier la coupe' : 'Nouvelle coupe'}</h2>
              <button onClick={() => setShowForm(false)} className="text-ink/40 hover:text-ink"><FiX size={20} /></button>
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

              <div className="rounded-xl border border-ink/10 bg-ink/[0.02] p-4">
                <label className="flex items-center gap-2 text-sm font-medium text-ink">
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

              <label className="flex items-center gap-2 text-sm text-ink/70">
                <input type="checkbox" checked={form.actif}
                  onChange={(e) => setForm({ ...form, actif: e.target.checked })} />
                Visible dans le catalogue client
              </label>

              {!editingId && (
                <p className="text-xs text-ink/40">Vous pourrez ajouter les photos juste après la création.</p>
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

      {/* Modal : gestion indépendante des photos */}
      {photoManagerCoupe && (
        <PhotoManager
          coupe={photoManagerCoupe}
          onClose={() => setPhotoManagerCoupe(null)}
          onChanged={() => refreshPhotoManager(photoManagerCoupe.id)}
        />
      )}
    </div>
  );
}

function PhotoManager({ coupe, onClose, onChanged }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const photos = coupe.photos || [];

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      await adminAddCoupePhoto(coupe.id, file);
      await onChanged();
    } catch (err) {
      setError(err.response?.data?.error || "Ajout de la photo impossible.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function handleDelete(photoId) {
    setError('');
    try {
      await adminDeleteCoupePhoto(coupe.id, photoId);
      await onChanged();
    } catch (err) {
      setError(err.response?.data?.error || 'Suppression impossible.');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-ink">Photos — {coupe.nom}</h2>
          <button onClick={onClose} className="text-ink/40 hover:text-ink"><FiX size={20} /></button>
        </div>
        <p className="mt-1 text-sm text-ink/50">
          Chaque photo peut être ajoutée ou supprimée indépendamment, jusqu'à 3 au total.
        </p>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => {
            const photo = photos[i];
            return (
              <div key={i} className="relative aspect-square overflow-hidden rounded-xl border border-ink/10 bg-plum-50">
                {photo ? (
                  <>
                    <img src={photo.url} alt="" className="h-full w-full object-cover" />
                    <button
                      onClick={() => handleDelete(photo.id)}
                      className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink/70 text-white hover:bg-clay-600"
                      title="Supprimer cette photo"
                    >
                      <FiX size={14} />
                    </button>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center text-plum-200">
                    <FiImage size={22} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <ErrorMessage>{error}</ErrorMessage>

        <div className="mt-5">
          <input
            ref={inputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleFileChange}
            disabled={photos.length >= 3 || uploading}
            className="input"
          />
          {photos.length >= 3 && (
            <p className="mt-1 text-xs text-ink/40">Maximum atteint — supprimez une photo pour en ajouter une autre.</p>
          )}
          {uploading && <p className="mt-1 text-xs text-plum-600">Envoi en cours…</p>}
        </div>

        <button onClick={onClose} className="btn-secondary mt-6 w-full">Terminer</button>
      </div>
    </div>
  );
}
