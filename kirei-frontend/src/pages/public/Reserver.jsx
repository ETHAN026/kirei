import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCoupes, getCreneauxDisponibles, creerRendezVous } from '../../api/public';
import Loader from '../../components/Loader';
import { ErrorMessage } from '../../components/Messages';

const STEPS = ['Coupe', 'Date & heure', 'Vos informations', 'Confirmation'];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function Reserver() {
  const location = useLocation();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [coupes, setCoupes] = useState([]);
  const [loadingCoupes, setLoadingCoupes] = useState(true);
  const [selectedCoupeId, setSelectedCoupeId] = useState(location.state?.coupeId || null);

  const [date, setDate] = useState(todayIso());
  const [creneaux, setCreneaux] = useState([]);
  const [loadingCreneaux, setLoadingCreneaux] = useState(false);
  const [selectedCreneau, setSelectedCreneau] = useState(null);

  const [form, setForm] = useState({ nom: '', prenom: '', email: '', telephone: '', adresse: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmedRdv, setConfirmedRdv] = useState(null);

  useEffect(() => {
    getCoupes()
      .then(setCoupes)
      .finally(() => setLoadingCoupes(false));
  }, []);

  useEffect(() => {
    if (step !== 1) return;
    setLoadingCreneaux(true);
    setSelectedCreneau(null);
    getCreneauxDisponibles(date)
      .then(setCreneaux)
      .catch(() => setCreneaux([]))
      .finally(() => setLoadingCreneaux(false));
  }, [date, step]);

  const selectedCoupe = useMemo(
    () => coupes.find((c) => c.id === selectedCoupeId),
    [coupes, selectedCoupeId]
  );

  function goToDateStep(coupeId) {
    setSelectedCoupeId(coupeId);
    setStep(1);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const rdv = await creerRendezVous({
        ...form,
        coupeId: selectedCoupeId,
        dateHeureDebut: selectedCreneau.debut,
      });
      setConfirmedRdv(rdv);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue, merci de réessayer.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      {/* Fil d'étapes */}
      <ol className="mb-12 flex items-center justify-between">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  i <= step ? 'bg-plum-600 text-white' : 'bg-ink/10 text-ink/40'
                }`}
              >
                {i + 1}
              </span>
              <span className={`hidden text-sm sm:inline ${i <= step ? 'text-ink' : 'text-ink/40'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && <div className="mx-3 h-px flex-1 bg-ink/10" />}
          </li>
        ))}
      </ol>

      {/* Étape 1 : choix de la coupe */}
      {step === 0 && (
        <div>
          <h1 className="font-display text-3xl text-ink">Choisissez votre coupe</h1>
          {loadingCoupes ? (
            <Loader />
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {coupes.map((c) => (
                <button
                  key={c.id}
                  onClick={() => goToDateStep(c.id)}
                  className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition ${
                    selectedCoupeId === c.id
                      ? 'border-plum-600 ring-2 ring-plum-100'
                      : 'border-ink/10 hover:border-plum-300'
                  }`}
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-plum-50">
                    {c.photos?.[0] && <img src={c.photos[0]} alt={c.nom} className="h-full w-full object-cover" />}
                  </div>
                  <div>
                    <p className="font-medium text-ink">{c.nom}</p>
                    <p className="text-sm text-plum-600">{c.prixFcfa} FCFA</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Étape 2 : date & créneau */}
      {step === 1 && (
        <div>
          <button onClick={() => setStep(0)} className="btn-ghost mb-4 !px-0">← Changer de coupe</button>
          <h1 className="font-display text-3xl text-ink">Choisissez la date et l'heure</h1>
          {selectedCoupe && (
            <p className="mt-1 text-sm text-ink/50">
              {selectedCoupe.nom} · {selectedCoupe.prixFcfa} FCFA
            </p>
          )}

          <div className="mt-6">
            <label className="label">Date</label>
            <input
              type="date"
              value={date}
              min={todayIso()}
              onChange={(e) => setDate(e.target.value)}
              className="input max-w-xs"
            />
          </div>

          <div className="mt-6">
            <label className="label">Créneaux disponibles</label>
            {loadingCreneaux ? (
              <Loader label="Recherche des créneaux…" />
            ) : creneaux.length === 0 ? (
              <p className="mt-2 text-sm text-ink/50">Aucun créneau disponible ce jour-là. Essayez une autre date.</p>
            ) : (
              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {creneaux.map((c) => {
                  const heure = new Date(c.debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                  const active = selectedCreneau?.debut === c.debut;
                  return (
                    <button
                      key={c.debut}
                      onClick={() => setSelectedCreneau(c)}
                      className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                        active
                          ? 'border-plum-600 bg-plum-600 text-white'
                          : 'border-ink/10 text-ink/70 hover:border-plum-300'
                      }`}
                    >
                      {heure}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            disabled={!selectedCreneau}
            onClick={() => setStep(2)}
            className="btn-primary mt-8"
          >
            Continuer
          </button>
        </div>
      )}

      {/* Étape 3 : informations client */}
      {step === 2 && (
        <div>
          <button onClick={() => setStep(1)} className="btn-ghost mb-4 !px-0">← Changer de créneau</button>
          <h1 className="font-display text-3xl text-ink">Vos informations</h1>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
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
              <label className="label">Téléphone</label>
              <input required className="input" value={form.telephone}
                onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
            </div>
            <div>
              <label className="label">E-mail</label>
              <input required type="email" className="input" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="label">Adresse (optionnel)</label>
              <input className="input" value={form.adresse}
                onChange={(e) => setForm({ ...form, adresse: e.target.value })} />
            </div>

            <ErrorMessage>{error}</ErrorMessage>

            <div className="rounded-2xl bg-plum-50 p-4 text-sm text-ink/70">
              <p className="font-medium text-ink">Récapitulatif</p>
              <p className="mt-1">{selectedCoupe?.nom} · {selectedCoupe?.prixFcfa} FCFA</p>
              <p>
                {selectedCreneau &&
                  new Date(selectedCreneau.debut).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })}
              </p>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Envoi en cours…' : 'Confirmer la demande de rendez-vous'}
            </button>
          </form>
        </div>
      )}

      {/* Étape 4 : confirmation */}
      {step === 3 && confirmedRdv && (
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-sage-500/15 text-3xl text-sage-600">
            ✓
          </div>
          <h1 className="font-display text-3xl text-ink">Demande envoyée !</h1>
          <p className="mx-auto mt-3 max-w-md text-ink/60">
            Votre demande de rendez-vous pour <strong>{confirmedRdv.coupe.nom}</strong> le{' '}
            <strong>
              {new Date(confirmedRdv.dateHeureDebut).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })}
            </strong>{' '}
            a bien été reçue. Vous recevrez un e-mail dès que le coiffeur l'aura validée.
          </p>
          <button onClick={() => navigate('/')} className="btn-primary mt-8">
            Retour à l'accueil
          </button>
        </div>
      )}
    </div>
  );
}
