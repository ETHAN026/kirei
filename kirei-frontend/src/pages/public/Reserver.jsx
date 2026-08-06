import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCoupes, getAssistants, getCreneauxDisponibles, creerRendezVous } from '../../api/public';
import Loader from '../../components/Loader';
import { ErrorMessage } from '../../components/Messages';
import { FiHome, FiScissors, FiCheck, FiUser, FiUsers } from 'react-icons/fi';

const STEPS = ['Coupe', 'Lieu', 'Praticien', 'Date & heure', 'Vos informations', 'Confirmation'];

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

  const [lieu, setLieu] = useState('SALON'); // 'SALON' | 'DOMICILE'

  const [assistants, setAssistants] = useState([]);
  const [loadingAssistants, setLoadingAssistants] = useState(true);
  const [selectedAssistantId, setSelectedAssistantId] = useState(''); // '' = pas de préférence (le coiffeur)

  const [date, setDate] = useState(todayIso());
  const [creneaux, setCreneaux] = useState([]);
  const [loadingCreneaux, setLoadingCreneaux] = useState(false);
  const [selectedCreneau, setSelectedCreneau] = useState(null);

  const [form, setForm] = useState({ nom: '', prenom: '', email: '', telephone: '', adresse: '', adresseDomicile: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmedRdv, setConfirmedRdv] = useState(null);

  useEffect(() => {
    getCoupes()
      .then(setCoupes)
      .finally(() => setLoadingCoupes(false));
    getAssistants()
      .then(setAssistants)
      .finally(() => setLoadingAssistants(false));
  }, []);

  useEffect(() => {
    if (step !== 3) return;
    setLoadingCreneaux(true);
    setSelectedCreneau(null);
    getCreneauxDisponibles(date, selectedAssistantId || undefined)
      .then(setCreneaux)
      .catch(() => setCreneaux([]))
      .finally(() => setLoadingCreneaux(false));
  }, [date, step, selectedAssistantId]);

  const selectedCoupe = useMemo(
    () => coupes.find((c) => c.id === selectedCoupeId),
    [coupes, selectedCoupeId]
  );
  const selectedAssistant = useMemo(
    () => assistants.find((a) => a.id === selectedAssistantId),
    [assistants, selectedAssistantId]
  );

  const domicileDisponible = selectedCoupe?.domicileDisponible && selectedCoupe?.prixDomicileFcfa != null;
  const tarifAffiche = lieu === 'DOMICILE' ? selectedCoupe?.prixDomicileFcfa : selectedCoupe?.prixFcfa;

  function goToLieuStep(coupeId) {
    setSelectedCoupeId(coupeId);
    setLieu('SALON');
    setStep(1);
  }

  function chooseLieu(value) {
    setLieu(value);
    setStep(2);
  }

  function choosePraticien(assistantId) {
    setSelectedAssistantId(assistantId);
    setStep(3);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const rdv = await creerRendezVous({
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
        telephone: form.telephone,
        adresse: form.adresse,
        coupeId: selectedCoupeId,
        dateHeureDebut: selectedCreneau.debut,
        lieuPrestation: lieu,
        adresseDomicile: lieu === 'DOMICILE' ? form.adresseDomicile : undefined,
        assistantId: selectedAssistantId || undefined,
      });
      setConfirmedRdv(rdv);
      setStep(5);
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
                  onClick={() => goToLieuStep(c.id)}
                  className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition ${
                    selectedCoupeId === c.id
                      ? 'border-plum-600 ring-2 ring-plum-100'
                      : 'border-ink/10 hover:border-plum-300'
                  }`}
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-plum-50">
                    {c.photos?.[0] && (
                      <img src={c.photos[0].url} alt={c.nom} className="h-full w-full object-cover" />
                    )}
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

      {/* Étape 2 : lieu de la prestation */}
      {step === 1 && (
        <div>
          <button onClick={() => setStep(0)} className="btn-ghost mb-4 !px-0">← Changer de coupe</button>
          <h1 className="font-display text-3xl text-ink">Où souhaitez-vous être coiffé(e) ?</h1>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <button
              onClick={() => chooseLieu('SALON')}
              className="rounded-2xl border border-ink/10 p-6 text-left transition hover:border-plum-300"
            >
              <FiScissors className="text-plum-600" size={26} />
              <p className="mt-3 font-display text-xl text-ink">Au salon</p>
              <p className="mt-1 text-sm text-ink/50">Prix de la coupe sélectionnée</p>
              <p className="mt-3 font-medium text-plum-600">{selectedCoupe?.prixFcfa} FCFA</p>
            </button>

            {domicileDisponible ? (
              <button
                onClick={() => chooseLieu('DOMICILE')}
                className="rounded-2xl border border-ink/10 p-6 text-left transition hover:border-plum-300"
              >
                <FiHome className="text-plum-600" size={26} />
                <p className="mt-3 font-display text-xl text-ink">À domicile</p>
                <p className="mt-1 text-sm text-ink/50">Le coiffeur se déplace chez vous</p>
                <p className="mt-3 font-medium text-plum-600">{selectedCoupe.prixDomicileFcfa} FCFA</p>
              </button>
            ) : (
              <div className="rounded-2xl border border-dashed border-ink/15 p-6 text-left text-ink/35">
                <FiHome size={26} />
                <p className="mt-3 font-display text-xl">À domicile</p>
                <p className="mt-1 text-sm">Non proposée pour cette coupe</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Étape 3 : choix du praticien */}
      {step === 2 && (
        <div>
          <button onClick={() => setStep(1)} className="btn-ghost mb-4 !px-0">← Changer le lieu</button>
          <h1 className="font-display text-3xl text-ink">Avec qui souhaitez-vous ce rendez-vous ?</h1>

          {loadingAssistants ? (
            <Loader />
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <button
                onClick={() => choosePraticien('')}
                className="rounded-2xl border border-ink/10 p-6 text-left transition hover:border-plum-300"
              >
                <FiUsers className="text-plum-600" size={26} />
                <p className="mt-3 font-display text-xl text-ink">Aucune préférence</p>
                <p className="mt-1 text-sm text-ink/50">Le coiffeur s'occupera de vous</p>
              </button>

              {assistants.map((a) => (
                <button
                  key={a.id}
                  onClick={() => choosePraticien(a.id)}
                  className="rounded-2xl border border-ink/10 p-6 text-left transition hover:border-plum-300"
                >
                  <FiUser className="text-plum-600" size={26} />
                  <p className="mt-3 font-display text-xl text-ink">{a.prenom} {a.nom}</p>
                  <p className="mt-1 text-sm text-ink/50">Assistant(e)</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Étape 4 : date & créneau */}
      {step === 3 && (
        <div>
          <button onClick={() => setStep(2)} className="btn-ghost mb-4 !px-0">← Changer de praticien</button>
          <h1 className="font-display text-3xl text-ink">Choisissez la date et l'heure</h1>
          <p className="mt-1 text-sm text-ink/50">
            {selectedCoupe?.nom} · {lieu === 'DOMICILE' ? 'À domicile' : 'Au salon'} · {tarifAffiche} FCFA
            {' · '}
            {selectedAssistant ? `${selectedAssistant.prenom} ${selectedAssistant.nom}` : 'Aucune préférence'}
          </p>

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
            onClick={() => setStep(4)}
            className="btn-primary mt-8"
          >
            Continuer
          </button>
        </div>
      )}

      {/* Étape 5 : informations client */}
      {step === 4 && (
        <div>
          <button onClick={() => setStep(3)} className="btn-ghost mb-4 !px-0">← Changer de créneau</button>
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

            {lieu === 'DOMICILE' ? (
              <div>
                <label className="label">Adresse pour le déplacement du coiffeur</label>
                <input required className="input" value={form.adresseDomicile}
                  placeholder="Quartier, rue, indication d'accès…"
                  onChange={(e) => setForm({ ...form, adresseDomicile: e.target.value })} />
              </div>
            ) : (
              <div>
                <label className="label">Adresse (optionnel)</label>
                <input className="input" value={form.adresse}
                  onChange={(e) => setForm({ ...form, adresse: e.target.value })} />
              </div>
            )}

            <ErrorMessage>{error}</ErrorMessage>

            <div className="rounded-2xl bg-plum-50 p-4 text-sm text-ink/70">
              <p className="font-medium text-ink">Récapitulatif</p>
              <p className="mt-1">{selectedCoupe?.nom} · {lieu === 'DOMICILE' ? 'À domicile' : 'Au salon'} · {tarifAffiche} FCFA</p>
              <p>{selectedAssistant ? `Avec ${selectedAssistant.prenom} ${selectedAssistant.nom}` : 'Aucune préférence de praticien'}</p>
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

      {/* Étape 6 : confirmation */}
      {step === 5 && confirmedRdv && (
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-sage-500/15 text-sage-600">
            <FiCheck size={30} />
          </div>
          <h1 className="font-display text-3xl text-ink">Demande envoyée !</h1>
          <p className="mx-auto mt-3 max-w-md text-ink/60">
            Votre demande de rendez-vous pour <strong>{confirmedRdv.coupe.nom}</strong>{' '}
            {confirmedRdv.lieuPrestation === 'DOMICILE' ? 'à domicile' : 'au salon'} le{' '}
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
