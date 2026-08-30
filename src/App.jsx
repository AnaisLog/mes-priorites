import { useState, useRef } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, ensureSignedIn } from "./firebase";
import logo from "./assets/logo.png";

// Palette inspirée du logo Anaïs Logerais (bleu nuit / turquoise)
// + une touche chaude et motivante (corail) pour l'énergie et la mémorisation.
const NAVY = "#1E3A45";
const TEAL = "#2FAFA6";
const CORAL = "#E8734A";
const CREAM = "#FBF7F1";
// Bleu azur du logo, utilisé pour le fond de page.
const AZURE_BG = "#1C93A0";
// Textes posés directement sur le fond azur (hors des cartes blanches).
const ON_AZURE_TEXT = "#FFFFFF";
const ON_AZURE_MUTED = "#D9F3F0";

const QUADRANTS = {
  "1-1": { key: "faire", label: "Faire", emoji: "🔥", sub: "important · urgent", color: CORAL, bg: "#FCE8DF" },
  "1-0": { key: "planifier", label: "Planifier", emoji: "🗓️", sub: "important · pas urgent", color: TEAL, bg: "#E1F3F1" },
  "0-1": { key: "deleguer", label: "Reporter ou déléguer", emoji: "🤝", sub: "pas important · urgent", color: "#D9A441", bg: "#FBF0DC" },
  "0-0": { key: "eliminer", label: "Se rappeler ou supprimer", emoji: "🗑️", sub: "pas important · pas urgent", color: "#8A97A0", bg: "#EEF1F2" },
};

function quadrantOf(t) {
  return QUADRANTS[`${t.important ? 1 : 0}-${t.urgent ? 1 : 0}`];
}

function docIdFor(id) {
  // Firestore interdit certains caractères (/) dans les ids de document.
  return id.toLowerCase().trim().replace(/\//g, "-");
}

export default function App() {
  const [identifiant, setIdentifiant] = useState(null);
  const [pseudoInput, setPseudoInput] = useState("");
  const [tasks, setTasks] = useState([]);
  const [text, setText] = useState("");
  const [important, setImportant] = useState(null);
  const [urgent, setUrgent] = useState(null);
  const [error, setError] = useState("");
  const [storageWarning, setStorageWarning] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const inputRef = useRef(null);

  async function handleLogin(e) {
    e.preventDefault();
    const clean = pseudoInput.trim();
    if (!clean) return;
    setStorageWarning(false);
    setLoggingIn(true);
    try {
      await ensureSignedIn();
      const snap = await getDoc(doc(db, "taches", docIdFor(clean)));
      setTasks(snap.exists() ? snap.data().tasks || [] : []);
      setIdentifiant(clean);
    } catch {
      setTasks([]);
      setStorageWarning(true);
      setIdentifiant(clean);
    } finally {
      setLoggingIn(false);
    }
  }

  async function persist(next) {
    setTasks(next);
    if (!identifiant) return;
    setSyncing(true);
    try {
      await setDoc(doc(db, "taches", docIdFor(identifiant)), { tasks: next });
      setStorageWarning(false);
    } catch {
      setStorageWarning(true);
    } finally {
      setSyncing(false);
    }
  }

  function handleAdd(e) {
    e.preventDefault();
    const clean = text.trim();
    if (!clean) {
      setError("Décris la tâche avant de l'ajouter.");
      return;
    }
    if (important === null || urgent === null) {
      setError("Choisis une case dans chaque colonne.");
      return;
    }
    setError("");
    const next = [{ id: Date.now() + Math.random(), text: clean, important, urgent }, ...tasks];
    persist(next);
    setText("");
    setImportant(null);
    setUrgent(null);
    inputRef.current?.focus();
  }

  function removeTask(id) {
    persist(tasks.filter((t) => t.id !== id));
  }

  function logout() {
    setIdentifiant(null);
    setTasks([]);
    setPseudoInput("");
  }

  const grouped = { faire: [], planifier: [], deleguer: [], eliminer: [] };
  tasks.forEach((t) => grouped[quadrantOf(t).key].push(t));

  const shell = {
    minHeight: "100vh",
    background: AZURE_BG,
    fontFamily: "'Poppins', sans-serif",
    color: NAVY,
  };

  if (!identifiant) {
    return (
      <div style={shell} className="flex items-center justify-center p-6">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-2xl p-8"
          style={{ background: "#FFFFFF", border: `1px solid ${NAVY}1A` }}
        >
          <img src={logo} alt="Logo" className="h-14 mb-4" />
          <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "1.6rem", fontWeight: 800, color: NAVY }}>
            Priorités ✨
          </p>
          <p className="mt-1 text-sm" style={{ color: "#7C8A90" }}>
            Entre un identifiant pour retrouver tes tâches.
          </p>
          <input
            autoFocus
            value={pseudoInput}
            onChange={(e) => setPseudoInput(e.target.value)}
            placeholder="Ton identifiant"
            className="mt-6 w-full rounded-lg px-4 py-3 text-base outline-none"
            style={{ background: CREAM, border: `1px solid ${NAVY}22`, color: NAVY }}
          />
          <button
            type="submit"
            disabled={!pseudoInput.trim() || loggingIn}
            className="mt-4 w-full rounded-lg py-3 font-semibold transition disabled:opacity-40"
            style={{ background: CORAL, color: "#FFFFFF" }}
          >
            {loggingIn ? "Connexion..." : "Continuer 🚀"}
          </button>
          <p className="mt-4 text-xs leading-relaxed" style={{ color: "#A6ADB0" }}>
            Ce n'est pas un mot de passe : c'est un nom qui sépare tes tâches
            de celles d'un autre identifiant. Elles sont sauvegardées en ligne,
            donc accessibles avec le même identifiant sur n'importe quel appareil.
          </p>
        </form>
      </div>
    );
  }

  return (
    <div style={shell} className="px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-10" />
            <div>
              <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: ON_AZURE_TEXT }} className="text-2xl sm:text-3xl">
                Priorités
              </h1>
              <p className="text-xs sm:text-sm" style={{ color: ON_AZURE_MUTED, fontWeight: 600 }}>
                Une chose à la fois, tu gères 💪
              </p>
            </div>
          </div>
          <button onClick={logout} className="text-sm underline decoration-dotted shrink-0" style={{ color: ON_AZURE_MUTED }}>
            {identifiant} · changer
          </button>
        </div>

        {storageWarning && (
          <p className="mt-3 text-xs" style={{ color: "#FFE8B8" }}>
            ⚠️ La synchronisation en ligne n'a pas pu être confirmée — tes
            tâches restent visibles ici mais pourraient ne pas être
            sauvegardées sur le serveur.
          </p>
        )}
        {syncing && !storageWarning && (
          <p className="mt-3 text-xs" style={{ color: ON_AZURE_MUTED }}>
            💾 Sauvegarde en ligne...
          </p>
        )}

        {/* Matrice — mise en avant en premier */}
        <div className="mt-6">
          <div className="grid grid-cols-[auto_1fr_1fr] gap-2 sm:gap-3">
            <div />
            <AxisLabel>⏰ Urgent</AxisLabel>
            <AxisLabel>🌿 Pas urgent</AxisLabel>

            <AxisLabel vertical>⭐ Important</AxisLabel>
            <Quadrant q={QUADRANTS["1-1"]} tasks={grouped.faire} onRemove={removeTask} />
            <Quadrant q={QUADRANTS["1-0"]} tasks={grouped.planifier} onRemove={removeTask} />

            <AxisLabel vertical>➖ Pas important</AxisLabel>
            <Quadrant q={QUADRANTS["0-1"]} tasks={grouped.deleguer} onRemove={removeTask} />
            <Quadrant q={QUADRANTS["0-0"]} tasks={grouped.eliminer} onRemove={removeTask} />
          </div>
        </div>

        {/* Saisie — en dessous */}
        <form
          onSubmit={handleAdd}
          className="mt-8 rounded-2xl p-5 sm:p-6"
          style={{ background: "#FFFFFF", border: `1px solid ${NAVY}1A` }}
        >
          <p className="text-sm font-semibold mb-3" style={{ color: NAVY }}>
            📝 Nouvelle tâche
          </p>
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Quelle tâche ?"
            className="w-full rounded-lg px-4 py-3 text-base outline-none"
            style={{ background: CREAM, border: `1px solid ${NAVY}22` }}
          />

          <div className="mt-4 grid grid-cols-2 gap-4">
            <ChoiceGroup
              label="Important"
              value={important}
              onChange={setImportant}
              trueOpt={{ l: "Important", emoji: "⭐" }}
              falseOpt={{ l: "Pas important", emoji: "➖" }}
              accent={TEAL}
            />
            <ChoiceGroup
              label="Urgent"
              value={urgent}
              onChange={setUrgent}
              trueOpt={{ l: "Urgent", emoji: "⏰" }}
              falseOpt={{ l: "Pas urgent", emoji: "🌿" }}
              accent={CORAL}
            />
          </div>

          {error && <p className="mt-3 text-sm" style={{ color: CORAL }}>{error}</p>}

          <button type="submit" className="mt-4 rounded-lg px-5 py-2.5 font-semibold" style={{ background: NAVY, color: "#FFFFFF" }}>
            Ajouter la tâche ✅
          </button>
        </form>
      </div>
    </div>
  );
}

function ChoiceGroup({ label, value, onChange, trueOpt, falseOpt, accent }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#A6ADB0" }}>{label}</p>
      <div className="mt-2 flex flex-col gap-2">
        {[{ v: true, ...trueOpt }, { v: false, ...falseOpt }].map((opt) => (
          <label
            key={String(opt.v)}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm"
            style={{
              background: value === opt.v ? accent : "#FBF7F1",
              color: value === opt.v ? "#FFFFFF" : "#1E3A45",
              border: `1px solid ${value === opt.v ? accent : "#1E3A4522"}`,
              transition: "all 120ms ease",
            }}
          >
            <input type="radio" className="sr-only" checked={value === opt.v} onChange={() => onChange(opt.v)} />
            <span>{opt.emoji}</span>
            {opt.l}
          </label>
        ))}
      </div>
    </div>
  );
}

function AxisLabel({ children, vertical }) {
  return (
    <div
      className={vertical ? "flex items-center justify-end pr-1 text-right" : "flex items-end justify-center pb-1"}
      style={{
        fontFamily: "'Poppins', sans-serif",
        color: ON_AZURE_MUTED,
        fontWeight: 700,
        fontSize: "0.8rem",
        writingMode: vertical ? "vertical-rl" : "horizontal-tb",
        transform: vertical ? "rotate(180deg)" : "none",
        minHeight: vertical ? "160px" : "auto",
      }}
    >
      {children}
    </div>
  );
}

function Quadrant({ q, tasks, onRemove }) {
  return (
    <div className="min-h-[160px] rounded-2xl p-4" style={{ background: q.bg, border: `1px solid ${q.color}33` }}>
      <div className="flex items-baseline justify-between">
        <p style={{ fontFamily: "'Poppins', sans-serif", color: q.color, fontWeight: 700 }}>
          {q.emoji} {q.label}
        </p>
        <span className="text-xs font-semibold" style={{ color: q.color, opacity: 0.8 }}>{tasks.length}</span>
      </div>
      <p className="text-[0.7rem]" style={{ color: q.color, opacity: 0.7 }}>{q.sub}</p>
      <div className="mt-3 flex flex-col gap-2">
        {tasks.length === 0 && <p className="text-xs italic" style={{ color: q.color, opacity: 0.5 }}>Rien ici.</p>}
        {tasks.map((t) => (
          <div key={t.id} className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm" style={{ background: "#FFFFFF", border: `1px solid ${q.color}33` }}>
            <span>{t.text}</span>
            <button onClick={() => onRemove(t.id)} aria-label="Supprimer la tâche" style={{ color: q.color, opacity: 0.7 }} className="shrink-0 text-xs">✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}
