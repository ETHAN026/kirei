import { useEffect, useState } from 'react';
import {
  adminGetSalon,
  adminUpdateSalon,
  adminUpdateHoraires,
  adminGetIndisponibilites,
  adminCreerIndisponibilite,
  adminSupprimerIndisponibilite,
} from '../../api/admin';
import Loader from '../../components/Loader';
import { ErrorMessage, SuccessMessage } from '../../components/Messages';

const JOURS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export default function ParametresAdmin() {
  const [loading, setLoading] = useState(true);
  const [salonForm, setSalonForm] = useState(null);
  const [horaires, setHoraires] = useState([]);
  const [indispos, setIndispos] = useState([]);
  const [newIndispo, setNewIndispo] = useState({ dateDebut: '', dateFin: '', motif: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([adminGetSalon(), adminGetIndisponibilites()]).then(([salon, indispoList]) => {
      setSalonForm({
        nomEnseigne: salon.nomEnseigne || '',
        adresse: salon.adresse || '',
        telephone: salon.telephone || '',
        email: salon.email || '',
        dureeCreneauMinutes: salon.dureeCreneauMinutes || 30,
      });
      const base = JOURS.map((_, jourSemaine) => {
        const existing = salon.horaires.find((h) => h.jourSemaine === jourSemaine);
        return existing || { jourSemaine, heureDebut: '08:00', heureFin: '18:00', ferme: jourSemaine === 0 };
      });
      setHoraires(base);
      setIndispos(indispoList);
      setLoading(false);
    });
  }, []);

  async function handleSaveSalon(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await adminUpdateSalon(salonForm);
      setMessage('Paramètres du salon mis à jour.');
    } catch (err) {
      setError(err.response?.data?.error || 'Enregistrement impossible.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveHoraires() {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await adminUpdateHoraires(horaires);
      setMessage('Horaires mis à jour.');
    } catch (err) {
      setError(err.response?.data?.error || 'Enregistrement impossible.');
    } finally {
      setSaving(false);
    }
  }

  function updateHoraire(jourSemaine, field, value) {
    setHoraires((prev) =>
      prev.map((h) => (h.jourSemaine === jourSemaine ? { ...h, [field]: value } : h))
    );
  }

  async function handleAddIndispo(e) {
    e.preventDefault();
    setError('');
    try {
      const created = await adminCreerIndisponibilite(newIndispo);
      setIndispos((prev) => [...prev, created]);
      setNewIndispo({ dateDebut: '', dateFin: '', motif: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Ajout impossible.');
    }
  }

  async function handleDeleteIndispo(id) {
    await adminSupprimerIndisponibilite(id);
    setIndispos((prev) => prev.filter((i) => i.id !== id));
  }

  if (loading) return <Loader />;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl text-ink">Paramètres du salon</h1>
      </div>

      {message && <SuccessMessage>{message}</SuccessMessage>}
      {error && <ErrorMessage>{error}</ErrorMessage>}

      {/* Infos du salon */}
      <section className="card">
        <h2 className="font-display text-xl text-ink">Informations générales</h2>
        <form onSubmit={handleSaveSalon} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Nom de l'enseigne</label>
            <input className="input" value={salonForm.nomEnseigne}
              onChange={(e) => setSalonForm({ ...salonForm, nomEnseigne: e.target.value })} />
          </div>
          <div>
            <label className="label">Téléphone</label>
            <input className="input" value={salonForm.telephone}
              onChange={(e) => setSalonForm({ ...salonForm, telephone: e.target.value })} />
          </div>
          <div>
            <label className="label">E-mail</label>
            <input className="input" value={salonForm.email}
              onChange={(e) => setSalonForm({ ...salonForm, email: e.target.value })} />
          </div>
          <div>
            <label className="label">Durée d'un créneau (minutes)</label>
            <input type="number" min="5" className="input" value={salonForm.dureeCreneauMinutes}
              onChange={(e) => setSalonForm({ ...salonForm, dureeCreneauMinutes: Number(e.target.value) })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Adresse</label>
            <input className="input" value={salonForm.adresse}
              onChange={(e) => setSalonForm({ ...salonForm, adresse: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </section>

      {/* Horaires hebdomadaires */}
      <section className="card">
        <h2 className="font-display text-xl text-ink">Horaires d'ouverture</h2>
        <div className="mt-4 space-y-3">
          {horaires.map((h) => (
            <div key={h.jourSemaine} className="flex flex-wrap items-center gap-3">
              <span className="w-24 text-sm font-medium text-ink">{JOURS[h.jourSemaine]}</span>
              <label className="flex items-center gap-1.5 text-xs text-ink/60">
                <input type="checkbox" checked={h.ferme}
                  onChange={(e) => updateHoraire(h.jourSemaine, 'ferme', e.target.checked)} />
                Fermé
              </label>
              {!h.ferme && (
                <>
                  <input type="time" className="input !w-32" value={h.heureDebut}
                    onChange={(e) => updateHoraire(h.jourSemaine, 'heureDebut', e.target.value)} />
                  <span className="text-ink/40">à</span>
                  <input type="time" className="input !w-32" value={h.heureFin}
                    onChange={(e) => updateHoraire(h.jourSemaine, 'heureFin', e.target.value)} />
                </>
              )}
            </div>
          ))}
        </div>
        <button onClick={handleSaveHoraires} disabled={saving} className="btn-primary mt-5">
          {saving ? 'Enregistrement…' : 'Enregistrer les horaires'}
        </button>
      </section>

      {/* Congés / indisponibilités */}
      <section className="card">
        <h2 className="font-display text-xl text-ink">Congés &amp; indisponibilités</h2>
        <form onSubmit={handleAddIndispo} className="mt-4 grid gap-3 sm:grid-cols-4">
          <div>
            <label className="label">Début</label>
            <input required type="datetime-local" className="input"
              value={newIndispo.dateDebut}
              onChange={(e) => setNewIndispo({ ...newIndispo, dateDebut: e.target.value })} />
          </div>
          <div>
            <label className="label">Fin</label>
            <input required type="datetime-local" className="input"
              value={newIndispo.dateFin}
              onChange={(e) => setNewIndispo({ ...newIndispo, dateFin: e.target.value })} />
          </div>
          <div>
            <label className="label">Motif</label>
            <input className="input" placeholder="Congés, pause…"
              value={newIndispo.motif}
              onChange={(e) => setNewIndispo({ ...newIndispo, motif: e.target.value })} />
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn-secondary w-full">+ Ajouter</button>
          </div>
        </form>

        <div className="mt-5 space-y-2">
          {indispos.length === 0 && <p className="text-sm text-ink/45">Aucune indisponibilité programmée.</p>}
          {indispos.map((i) => (
            <div key={i.id} className="flex items-center justify-between rounded-xl border border-ink/10 px-4 py-2.5 text-sm">
              <div>
                <p className="text-ink">
                  {new Date(i.dateDebut).toLocaleString('fr-FR')} → {new Date(i.dateFin).toLocaleString('fr-FR')}
                </p>
                {i.motif && <p className="text-xs text-ink/45">{i.motif}</p>}
              </div>
              <button onClick={() => handleDeleteIndispo(i.id)} className="text-xs font-medium text-clay-600 hover:underline">
                Supprimer
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
