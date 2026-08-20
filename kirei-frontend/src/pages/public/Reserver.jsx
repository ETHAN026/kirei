import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCoupes, getAssistants, getCreneauxDisponibles, creerRendezVous } from '../../api/public';
import Loader from '../../components/Loader';
import { ErrorMessage } from '../../components/Messages';
import BarberPole from '../../components/BarberPole';
import { FiHome, FiScissors, FiCheck, FiUser, FiUsers, FiArrowLeft, FiArrowRight } from 'react-icons/fi';

const STEPS = ['Coupe', 'Lieu', 'Praticien', 'Date', 'Infos', 'Confirmation'];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

const itemBase =
  'group relative rounded-2xl border p-6 text-left transition-all duration-300';
const itemActive = 'border-[#2F54C4] bg-night text-white shadow-lg shadow-[#2F54C4]/10';
const itemIdle = 'bg-white border-black/10 hover:border-[#2F54C4]/40 hover:shadow-md';
const iconBase = 'flex h-12 w-12 items-center justify-center rounded-xl border transition-colors duration-300';
const iconActive = 'border-white/30 text-white';
const iconIdle = 'border-[#2F54C4]/20 text-[#2F54C4]';

export default function Reserver() {
  const location = useLocation();
  const navigate = useNavigate();

  const hasCoupeId = Boolean(location.state?.coupeId);
  const [step, setStep] = useState(hasCoupeId ? 1 : 0);
  const [coupes, setCoupes] = useState([]);
  const [loadingCoupes, setLoadingCoupes] = useState(true);
  const [selectedCoupeId, setSelectedCoupeId] = useState(location.state?.coupeId || null);

  const [lieu, setLieu] = useState('SALON');

  const [assistants, setAssistants] = useState([]);
  const [loadingAssistants, setLoadingAssistants] = useState(true);
  const [selectedAssistantId, setSelectedAssistantId] = useState('');

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

  const dateAffichee = selectedCreneau
    ? new Date(selectedCreneau.debut).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })
    : null;

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

  const backBtn = (target, label) => (
    <button onClick={() => setStep(target)} className="btn-underline group mb-6 text-night/60 hover:text-night">
      <FiArrowLeft className="transition-transform duration-300 group-hover:-translate-x-1" /> {label}
    </button>
  );

  const stepTitle = (text, sub) => (
    <>
      <h2 className="font-display text-[clamp(1.5rem,3vw,2.2rem)] font-black uppercase leading-[0.95] tracking-tight text-night">
        {text}
      </h2>
      {sub && <p className="mt-2 font-mono text-[10px] uppercase tracking-wide2 text-night/50">{sub}</p>}
    </>
  );

  const recapRow = (label, value, strong) => (
    <div className="flex items-baseline justify-between gap-4 border-b border-white/10 py-3 last:border-0">
      <span className="mono-label text-white/35">{label}</span>
      <span className={`text-right text-sm ${strong ? 'font-semibold text-white' : 'text-white/75'}`}>{value}</span>
    </div>
  );

  return (
    <div className="page-enter relative mx-auto max-w-6xl px-5 pb-24 pt-28 md:px-8 md:pt-32">
      {/* En-tête éditorial */}
      <div className="flex flex-col justify-between gap-6 border-b border-black/15 pb-10 md:flex-row md:items-end">
        <div>
          <p className="mono-label fade-up text-clay-500" style={{ '--d': '0.1s' }}>
            Réservation — No° 03
          </p>
          <h1 className="hero-line mt-4 font-display font-black uppercase leading-[0.85] tracking-tight text-night">
            <span className="block text-[clamp(2rem,5vw,4rem)]" style={{ '--d': '0.25s' }}>
              RÉSERVER
            </span>
          </h1>
        </div>
        <p className="mono-label max-w-xs text-right text-night/40">
          Sans file d'attente — confirmation par e-mail
        </p>
      </div>

      {/* Résumé mobile */}
      {step > 0 && step < 5 && (
        <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-[#2F54C4]/20 bg-white px-4 py-3 font-mono text-[10px] uppercase tracking-wide2 text-night/60 lg:hidden">
          <span className="truncate">
            {selectedCoupe?.nom || '—'} · {tarifAffiche ?? '—'} FCFA
          </span>
          <span className="shrink-0">
            {dateAffichee ? new Date(selectedCreneau.debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : lieu === 'DOMICILE' ? 'Domicile' : 'Salon'}
          </span>
        </div>
      )}

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_320px]">
        {/* Colonne principale */}
        <div>
          {/* Fil d'étapes */}
          <ol className="mb-12 flex items-center" aria-label="Progression">
            {STEPS.map((label, i) => (
              <li key={label} className="flex flex-1 items-center last:flex-none">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[10px] transition-colors duration-500 ${
                    i <= step ? 'bg-[#2F54C4] text-white' : 'border border-black/15 text-night/35'
                  }`}
                  aria-current={i === step ? 'step' : undefined}
                >
                  {i + 1}
                </span>
                <span className={`hidden text-[10px] uppercase tracking-wide2 sm:inline ${i <= step ? 'text-night' : 'text-night/30'}`}>
                  {label}
                </span>
                {i < STEPS.length - 1 && (
                  <div className={`mx-3 h-px flex-1 transition-colors duration-500 ${i < step ? 'bg-[#2F54C4]' : 'bg-black/15'}`} />
                )}
              </li>
            ))}
          </ol>

          <div key={step} className="step-anim">
            {/* Étape 1 : choix de la coupe */}
            {step === 0 && (
              <div>
                {stepTitle('Choisissez votre coupe', '01 — Catalogue des prestations')}
                {loadingCoupes ? (
                  <Loader />
                ) : (
                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    {coupes.map((c) => {
                      const active = selectedCoupeId === c.id;
                      return (
                        <button
                          key={c.id}
                          onClick={() => goToLieuStep(c.id)}
                          className={`${itemBase} ${active ? itemActive : itemIdle}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <p className="font-display text-xl font-black uppercase tracking-tight">{c.nom}</p>
                              <p className={`mt-1 font-mono text-[10px] uppercase tracking-wide2 ${active ? 'text-white/60' : 'text-night/50'}`}>
                                {c.prixFcfa} FCFA
                              </p>
                            </div>
                            <FiArrowRight className={`transition-colors ${active ? 'text-white' : 'text-night/30 group-hover:text-[#2F54C4]'}`} size={18} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Étape 2 : lieu de la prestation */}
            {step === 1 && (
              <div>
                {hasCoupeId ? (
                  <button onClick={() => navigate('/')} className="btn-underline group mb-6 text-night/60 hover:text-night">
                    <FiArrowLeft className="transition-transform duration-300 group-hover:-translate-x-1" /> Retour à l'accueil
                  </button>
                ) : (
                  backBtn(0, 'Changer de coupe')
                )}
                {stepTitle('Où souhaitez-vous être coiffé(e) ?', '02 — Lieu de la prestation')}

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <button
                    onClick={() => chooseLieu('SALON')}
                    className={`${itemBase} ${lieu === 'SALON' ? itemActive : itemIdle}`}
                  >
                    <div className={`${iconBase} ${lieu === 'SALON' ? iconActive : iconIdle}`}>
                      <FiScissors size={22} />
                    </div>
                    <p className="mt-4 font-display text-2xl font-black uppercase tracking-tight">Au salon</p>
                    <p className={`mt-1 text-sm ${lieu === 'SALON' ? 'text-white/60' : 'text-night/50'}`}>
                      Prix de la coupe sélectionnée
                    </p>
                    <p className={`mt-3 font-mono text-xs tracking-wide ${lieu === 'SALON' ? 'text-white' : 'text-night'}`}>
                      {selectedCoupe?.prixFcfa} FCFA
                    </p>
                  </button>

                  {domicileDisponible ? (
                    <button
                      onClick={() => chooseLieu('DOMICILE')}
                      className={`${itemBase} ${lieu === 'DOMICILE' ? itemActive : itemIdle}`}
                    >
                      <div className={`${iconBase} ${lieu === 'DOMICILE' ? iconActive : iconIdle}`}>
                        <FiHome size={22} />
                      </div>
                      <p className="mt-4 font-display text-2xl font-black uppercase tracking-tight">À domicile</p>
                      <p className={`mt-1 text-sm ${lieu === 'DOMICILE' ? 'text-white/60' : 'text-night/50'}`}>
                        Le coiffeur se déplace chez vous
                      </p>
                      <p className={`mt-3 font-mono text-xs tracking-wide ${lieu === 'DOMICILE' ? 'text-white' : 'text-night'}`}>
                        {selectedCoupe.prixDomicileFcfa} FCFA
                      </p>
                    </button>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-black/15 p-6 text-left text-night/35">
                      <FiHome size={22} />
                      <p className="mt-4 font-display text-2xl font-black uppercase tracking-tight">À domicile</p>
                      <p className="mt-1 text-sm">Non proposée pour cette coupe</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Étape 3 : choix du praticien */}
            {step === 2 && (
              <div>
                {backBtn(1, 'Changer le lieu')}
                {stepTitle('Avec qui souhaitez-vous ce rendez-vous ?', '03 — Praticien')}

                {loadingAssistants ? (
                  <Loader />
                ) : (
                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <button
                      onClick={() => choosePraticien('')}
                      className={`${itemBase} ${selectedAssistantId === '' ? itemActive : itemIdle}`}
                    >
                      <div className={`${iconBase} ${selectedAssistantId === '' ? iconActive : iconIdle}`}>
                        <FiUsers size={22} />
                      </div>
                      <p className="mt-4 font-display text-2xl font-black uppercase tracking-tight">SERGE — Le patron</p>
                      <p className={`mt-1 text-sm ${selectedAssistantId === '' ? 'text-white/60' : 'text-night/50'}`}>
                        Le coiffeur s'occupera de vous
                      </p>
                    </button>

                    {assistants.map((a) => {
                      const active = selectedAssistantId === a.id;
                      return (
                        <button
                          key={a.id}
                          onClick={() => choosePraticien(a.id)}
                          className={`${itemBase} ${active ? itemActive : itemIdle}`}
                        >
                          <div className={`${iconBase} ${active ? iconActive : iconIdle}`}>
                            <FiUser size={22} />
                          </div>
                          <p className="mt-4 font-display text-2xl font-black uppercase tracking-tight">
                            {a.prenom} {a.nom}
                          </p>
                          <p className={`mt-1 text-sm ${active ? 'text-white/60' : 'text-night/50'}`}>Assistant(e)</p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Étape 4 : date & créneau */}
            {step === 3 && (
              <div>
                {backBtn(2, 'Changer de praticien')}
                {stepTitle('Choisissez la date et l\'heure', '04 — Créneaux disponibles')}
                <p className="mt-2 font-mono text-[10px] uppercase tracking-wide2 text-night/50">
                  {selectedCoupe?.nom} · {lieu === 'DOMICILE' ? 'À domicile' : 'Au salon'} · {tarifAffiche} FCFA
                  {' · '}
                  {selectedAssistant ? `${selectedAssistant.prenom} ${selectedAssistant.nom}` : 'SERGE — Le patron'}
                </p>

                <div className="mt-8">
                  <label className="mb-2 block font-mono text-[10px] uppercase tracking-wide2 text-night/50">Date</label>
                  <input
                    type="date"
                    value={date}
                    min={todayIso()}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full max-w-xs rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-night focus:border-[#2F54C4] focus:outline-none focus:ring-1 focus:ring-[#2F54C4]/40"
                  />
                </div>

                <div className="mt-8">
                  <label className="mb-2 block font-mono text-[10px] uppercase tracking-wide2 text-night/50">
                    Créneaux disponibles
                  </label>
                  {loadingCreneaux ? (
                    <Loader label="Recherche des créneaux…" />
                  ) : creneaux.length === 0 ? (
                    <p className="mt-2 text-sm text-night/50">
                      Aucun créneau disponible ce jour-là. Essayez une autre date.
                    </p>
                  ) : (
                    <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {creneaux.map((c) => {
                        const heure = new Date(c.debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                        const active = selectedCreneau?.debut === c.debut;
                        return (
                          <button
                            key={c.debut}
                            onClick={() => setSelectedCreneau(c)}
                            className={`rounded-xl border px-3 py-2.5 font-mono text-xs transition ${
                              active ? 'border-[#2F54C4] bg-[#2F54C4] text-white' : 'border-black/10 bg-white text-night/70 hover:border-[#2F54C4]/40'
                            }`}
                          >
                            {heure}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <button disabled={!selectedCreneau} onClick={() => setStep(4)} className="btn-solid mt-10">
                  Continuer <FiArrowRight size={15} />
                </button>
              </div>
            )}

            {/* Étape 5 : informations client */}
            {step === 4 && (
              <div>
                {backBtn(3, 'Changer de créneau')}
                {stepTitle('Vos informations', '05 — Coordonnées')}

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block font-mono text-[10px] uppercase tracking-wide2 text-night/50">Prénom</label>
                      <input
                        required
                        className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-night placeholder:text-night/30 focus:border-[#2F54C4] focus:outline-none focus:ring-1 focus:ring-[#2F54C4]/40"
                        value={form.prenom}
                        onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block font-mono text-[10px] uppercase tracking-wide2 text-night/50">Nom</label>
                      <input
                        required
                        className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-night placeholder:text-night/30 focus:border-[#2F54C4] focus:outline-none focus:ring-1 focus:ring-[#2F54C4]/40"
                        value={form.nom}
                        onChange={(e) => setForm({ ...form, nom: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block font-mono text-[10px] uppercase tracking-wide2 text-night/50">Téléphone</label>
                    <input
                      required
                      className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-night placeholder:text-night/30 focus:border-[#2F54C4] focus:outline-none focus:ring-1 focus:ring-[#2F54C4]/40"
                      value={form.telephone}
                      onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block font-mono text-[10px] uppercase tracking-wide2 text-night/50">E-mail</label>
                    <input
                      required
                      type="email"
                      className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-night placeholder:text-night/30 focus:border-[#2F54C4] focus:outline-none focus:ring-1 focus:ring-[#2F54C4]/40"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>

                  {lieu === 'DOMICILE' ? (
                    <div>
                      <label className="mb-2 block font-mono text-[10px] uppercase tracking-wide2 text-night/50">
                        Adresse pour le déplacement du coiffeur
                      </label>
                      <input
                        required
                        className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-night placeholder:text-night/30 focus:border-[#2F54C4] focus:outline-none focus:ring-1 focus:ring-[#2F54C4]/40"
                        value={form.adresseDomicile}
                        placeholder="Quartier, rue, indication d'accès…"
                        onChange={(e) => setForm({ ...form, adresseDomicile: e.target.value })}
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="mb-2 block font-mono text-[10px] uppercase tracking-wide2 text-night/50">
                        Adresse (optionnel)
                      </label>
                      <input
                        className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-night placeholder:text-night/30 focus:border-[#2F54C4] focus:outline-none focus:ring-1 focus:ring-[#2F54C4]/40"
                        value={form.adresse}
                        onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                      />
                    </div>
                  )}

                  <ErrorMessage>{error}</ErrorMessage>

                  <button type="submit" disabled={submitting} className="btn-solid w-full">
                    {submitting ? 'Envoi en cours…' : 'Confirmer la demande de rendez-vous'}
                  </button>
                </form>
              </div>
            )}

            {/* Étape 6 : confirmation */}
            {step === 5 && confirmedRdv && (
              <div className="text-center">
                <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-[#2F54C4] text-white">
                  <FiCheck size={30} />
                </div>
                <h2 className="font-display text-[clamp(1.5rem,3vw,2.2rem)] font-black uppercase leading-[0.95] tracking-tight text-night">
                  Demande envoyée !
                </h2>
                <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-night/60">
                  Votre demande de rendez-vous pour <strong className="text-night">{confirmedRdv.coupe.nom}</strong>{' '}
                  {confirmedRdv.lieuPrestation === 'DOMICILE' ? 'à domicile' : 'au salon'} le{' '}
                  <strong className="text-night">
                    {new Date(confirmedRdv.dateHeureDebut).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })}
                  </strong>{' '}
                  a bien été reçue. Vous recevrez un e-mail dès que le coiffeur l'aura validée.
                </p>
                <button onClick={() => navigate('/')} className="btn-solid mt-10">
                  Retour à l'accueil
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Récapitulatif sticky (desktop) */}
        <aside className="hidden lg:block" aria-label="Récapitulatif">
          <div className="sticky top-24 rounded-2xl bg-night px-6 py-7 text-white">
            <div className="flex items-center justify-between">
              <p className="mono-label text-white/50">Récapitulatif</p>
              <BarberPole style={{ '--pole-w': '10px', '--pole-h': '26px' }} />
            </div>
            {(step === 0 && !hasCoupeId) ? (
              <p className="mt-6 font-mono text-[10px] uppercase leading-relaxed tracking-wide2 text-white/35">
                Votre sélection apparaîtra ici, étape par étape.
              </p>
            ) : (
              <div className="mt-4">
                {recapRow('Prestation', selectedCoupe?.nom || '—', true)}
                {recapRow('Prix', tarifAffiche != null ? `${tarifAffiche} FCFA` : '—', false)}
                {recapRow('Lieu', lieu === 'DOMICILE' ? 'À domicile' : 'Au salon', false)}
                {recapRow(
                  'Praticien',
                  selectedAssistant ? `${selectedAssistant.prenom} ${selectedAssistant.nom}` : 'SERGE — Le patron',
                  false
                )}
                {recapRow('Date', dateAffichee || '—', false)}
              </div>
            )}
            <div className="mt-6 border-t border-white/15 pt-4">
              <p className="font-mono text-[9px] uppercase leading-relaxed tracking-wide2 text-white/30">
                No° 03 — {new Date().toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
