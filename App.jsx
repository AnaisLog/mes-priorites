import { useState, useRef } from "react";

const QUADRANTS = {
  "1-1": { key: "faire", label: "Faire", sub: "important · urgent", color: "#B5563E", bg: "#F6E9E4" },
  "1-0": { key: "planifier", label: "Planifier", sub: "important · pas urgent", color: "#3E6B63", bg: "#E7EFEC" },
  "0-1": { key: "deleguer", label: "Déléguer", sub: "pas important · urgent", color: "#A9823E", bg: "#F3ECDD" },
  "0-0": { key: "eliminer", label: "Éliminer", sub: "pas important · pas urgent", color: "#8A857C", bg: "#EFEDE8" },
};

function quadrantOf(t) {
  return QUADRANTS[`${t.important ? 1 : 0}-${t.urgent ? 1 : 0}`];
}

function storageKeyFor(id) {
  return `matrice-eisenhower:taches:${id.toLowerCase()}`;
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
  const inputRef = useRef(null);

  function handleLogin(e) {
    e.preventDefault();
    const clean = pseudoInput.trim();
    if (!clean) return;
    setStorageWarning(false);
    try {
      const raw = window.localStorage.getItem(storageKeyFor(clean));
      setTasks(raw ? JSON.parse(raw) : []);
    } catch {
      setTasks([]);
      setStorageWarning(true);
    }
    setIdentifiant(clean);
  }

  function persist(next) {
    setTasks(next);
    if (!identifiant) return;
    try {
      window.localStorage.setItem(storageKeyFor(identifiant), JSON.stringify(next));
    } catch {
      setStorageWarning(true);
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
    background: "#F3EFE8",
    fontFamily: "'IBM Plex Sans', sans-serif",
    color: "#2B2A26",
  };

  if (!identifiant) {
    return (
      <div style={shell} className="flex items-center justify-center p-6">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-2xl p-8"
          style={{ background: "#FFFDF9", border: "1px solid #E4DFD3" }}
        >
          <p style={{ fontFamily: "'Fraunces', serif", fontSize: "1.6rem", fontWeight: 600 }}>
            Priorités
          </p>
          <p className="mt-1 text-sm" style={{ color: "#8A857C" }}>
            Entre un identifiant pour retrouver tes tâches.
          </p>
          <input
            autoFocus
            value={pseudoInput}
            onChange={(e) => setPseudoInput(e.target.value)}
            placeholder="Ton identifiant"
            className="mt-6 w-full rounded-lg px-4 py-3 text-base outline-none"
            style={{ background: "#F3EFE8", border: "1px solid #E4DFD3", color: "#2B2A26" }}
          />
          <button
            type="submit"
            disabled={!pseudoInput.trim()}
            className="mt-4 w-full rounded-lg py-3 font-medium transition disabled:opacity-40"
            style={{ background: "#B5563E", color: "#FFFDF9" }}
          >
            Continuer
          </button>
          <p className="mt-4 text-xs leading-relaxed" style={{ color: "#A6A197" }}>
            Ce n'est pas un mot de passe : c'est un nom qui sépare tes tâches
            de celles d'un autre identifiant, sauvegardé dans ce navigateur.
            Sur un autre appareil ou navigateur, tu repartiras à zéro.
          </p>
        </form>
      </div>
    );
  }

  return (
    <div style={shell} className="px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-baseline justify-between">
          <h1 style={{ fontFamily: "'Fraunces', serif" }} className="text-3xl font-semibold">
            Priorités
          </h1>
          <button onClick={logout} className="text-sm underline decoration-dotted" style={{ color: "#8A857C" }}>
            {identifiant} · changer
          </button>
        </div>

        {storageWarning && (
          <p className="mt-2 text-xs" style={{ color: "#A9823E" }}>
            La sauvegarde locale n'a pas pu être confirmée — tes tâches
            restent visibles ici mais pourraient ne pas être conservées après
            fermeture de l'onglet.
          </p>
        )}

        <form
          onSubmit={handleAdd}
          className="mt-6 rounded-2xl p-5 sm:p-6"
          style={{ background: "#FFFDF9", border: "1px solid #E4DFD3" }}
        >
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Quelle tâche ?"
            className="w-full rounded-lg px-4 py-3 text-base outline-none"
            style={{ background: "#F3EFE8", border: "1px solid #E4DFD3" }}
          />

          <div className="mt-4 grid grid-cols-2 gap-4">
            <ChoiceGroup label="Important" value={important} onChange={setImportant} trueLabel="Important" falseLabel="Pas important" accent="#3E6B63" />
            <ChoiceGroup label="Urgent" value={urgent} onChange={setUrgent} trueLabel="Urgent" falseLabel="Pas urgent" accent="#B5563E" />
          </div>

          {error && <p className="mt-3 text-sm" style={{ color: "#B5563E" }}>{error}</p>}

          <button type="submit" className="mt-4 rounded-lg px-5 py-2.5 font-medium" style={{ background: "#2B2A26", color: "#FFFDF9" }}>
            Ajouter la tâche
          </button>
        </form>

        <div className="mt-8">
          <div className="grid grid-cols-[auto_1fr_1fr] gap-2 sm:gap-3">
            <div />
            <AxisLabel>Urgent</AxisLabel>
            <AxisLabel>Pas urgent</AxisLabel>

            <AxisLabel vertical>Important</AxisLabel>
            <Quadrant q={QUADRANTS["1-1"]} tasks={grouped.faire} onRemove={removeTask} />
            <Quadrant q={QUADRANTS["1-0"]} tasks={grouped.planifier} onRemove={removeTask} />

            <AxisLabel vertical>Pas important</AxisLabel>
            <Quadrant q={QUADRANTS["0-1"]} tasks={grouped.deleguer} onRemove={removeTask} />
            <Quadrant q={QUADRANTS["0-0"]} tasks={grouped.eliminer} onRemove={removeTask} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ChoiceGroup({ label, value, onChange, trueLabel, falseLabel, accent }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "#A6A197" }}>{label}</p>
      <div className="mt-2 flex flex-col gap-2">
        {[{ v: true, l: trueLabel }, { v: false, l: falseLabel }].map((opt) => (
          <label
            key={String(opt.v)}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm"
            style={{
              background: value === opt.v ? accent : "#F3EFE8",
              color: value === opt.v ? "#FFFDF9" : "#2B2A26",
              border: `1px solid ${value === opt.v ? accent : "#E4DFD3"}`,
              transition: "all 120ms ease",
            }}
          >
            <input type="radio" className="sr-only" checked={value === opt.v} onChange={() => onChange(opt.v)} />
            <span
              aria-hidden
              className="flex h-4 w-4 items-center justify-center rounded-full"
              style={{ border: `1.5px solid ${value === opt.v ? "#FFFDF9" : "#A6A197"}` }}
            >
              {value === opt.v && <span className="h-2 w-2 rounded-full" style={{ background: "#FFFDF9" }} />}
            </span>
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
        fontFamily: "'Fraunces', serif",
        color: "#8A857C",
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
    <div className="min-h-[160px] rounded-2xl p-4" style={{ background: q.bg, border: `1px solid ${q.color}22` }}>
      <div className="flex items-baseline justify-between">
        <p style={{ fontFamily: "'Fraunces', serif", color: q.color }} className="font-medium">{q.label}</p>
        <span className="text-xs" style={{ color: q.color, opacity: 0.7 }}>{tasks.length}</span>
      </div>
      <p className="text-[0.7rem]" style={{ color: q.color, opacity: 0.6 }}>{q.sub}</p>
      <div className="mt-3 flex flex-col gap-2">
        {tasks.length === 0 && <p className="text-xs italic" style={{ color: q.color, opacity: 0.45 }}>Rien ici.</p>}
        {tasks.map((t) => (
          <div key={t.id} className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm" style={{ background: "#FFFDF9", border: `1px solid ${q.color}33` }}>
            <span>{t.text}</span>
            <button onClick={() => onRemove(t.id)} aria-label="Supprimer la tâche" style={{ color: q.color, opacity: 0.6 }} className="shrink-0 text-xs">✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}
