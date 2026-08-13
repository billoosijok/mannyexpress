import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Phone,
  Plus,
} from "lucide-react";
import { agendaType, emptyEvent } from "../constants";
import { subscribeToAgenda } from "../lib/agenda";
import { subscribeToVisits } from "../lib/visits";
import {
  WEEKDAYS,
  addMonths,
  monthGrid,
  parseDateKey,
  startOfMonth,
  toDateKey,
  todayKey,
} from "../lib/calendar";
import { formatDayLabel, formatMonthLabel, formatShortDay } from "../lib/format";
import AgendaEventForm from "./AgendaEventForm";
import { ErrorNote, Spinner } from "./ui";

/** Entries with no hour go under the ones that have one. */
const LAST = "99:99";

const FICHE = {
  label: "Fiche de visite",
  dot: "bg-muted",
  bar: "bg-muted",
  chip: "border-line bg-cream text-muted",
};

export default function AgendaView({ user, isOwner, onSelectVisit }) {
  const [events, setEvents] = useState(null);
  const [visits, setVisits] = useState([]);
  const [error, setError] = useState("");
  const [view, setView] = useState("mois"); // mois | liste
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState(todayKey);
  const [editing, setEditing] = useState(null); // null | { eventId, initial, canDelete }

  useEffect(() => {
    return subscribeToAgenda(
      (data) => {
        setError("");
        setEvents(data);
      },
      () => setError("Impossible de charger l'agenda. Vérifiez la connexion.")
    );
  }, []);

  // Visit sheets already saved are shown alongside the appointments, so a day
  // reads as one story. A failure here only costs that extra layer: the agenda
  // itself keeps working and reports its own errors.
  useEffect(() => {
    return subscribeToVisits(setVisits, () => setVisits([]));
  }, []);

  const entriesByDay = useMemo(() => {
    const byDay = new Map();
    const add = (day, entry) => {
      if (!day) return;
      const existing = byDay.get(day);
      if (existing) existing.push(entry);
      else byDay.set(day, [entry]);
    };

    for (const event of events || []) {
      add(event.date, {
        id: `event-${event.id}`,
        kind: "event",
        heure: event.heure || LAST,
        event,
      });
    }
    for (const visit of visits) {
      add(visit.dateVisite, {
        id: `visit-${visit.id}`,
        kind: "visit",
        heure: LAST,
        visit,
      });
    }
    for (const entries of byDay.values()) {
      entries.sort((left, right) => left.heure.localeCompare(right.heure));
    }
    return byDay;
  }, [events, visits]);

  const upcoming = useMemo(() => {
    const from = todayKey();
    return [...entriesByDay.entries()]
      .filter(([day]) => day >= from)
      .sort(([left], [right]) => left.localeCompare(right))
      .flatMap(([day, entries]) => entries.map((entry) => ({ ...entry, day })));
  }, [entriesByDay]);

  const cells = useMemo(() => monthGrid(month), [month]);
  const dayEntries = entriesByDay.get(selectedDay) || [];

  function goToMonth(delta) {
    const next = addMonths(month, delta);
    setMonth(next);
    // Keeping the list under the grid in step with it: the current month
    // reopens on today, any other month on its first day.
    const today = todayKey();
    const first = toDateKey(next);
    setSelectedDay(today.slice(0, 7) === first.slice(0, 7) ? today : first);
  }

  function selectDay(cell) {
    setSelectedDay(cell.key);
    if (!cell.inMonth) setMonth(startOfMonth(parseDateKey(cell.key)));
  }

  function openNew(day) {
    setEditing({ eventId: null, initial: emptyEvent(day), canDelete: false });
  }

  // Only the form's own fields are carried over: the edit writes the whole
  // object back, and the authorship stamps must survive it untouched.
  function openEvent(event) {
    setEditing({
      eventId: event.id,
      initial: {
        type: event.type || "visite",
        date: event.date || "",
        heure: event.heure || "",
        clientNom: event.clientNom || "",
        clientTel: event.clientTel || "",
        adresse: event.adresse || "",
        notes: event.notes || "",
      },
      canDelete: isOwner || event.createdBy === user.uid,
    });
  }

  if (error) {
    return (
      <div className="pt-6">
        <ErrorNote>{error}</ErrorNote>
      </div>
    );
  }

  if (events === null) {
    return (
      <div className="flex justify-center py-16 text-gold">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="pb-4">
      <div className="mb-4 flex rounded-lg border border-line bg-white p-1">
        {[
          { value: "mois", label: "Mois" },
          { value: "liste", label: "À venir" },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setView(option.value)}
            className={`min-h-[40px] flex-1 rounded-md text-sm font-medium transition ${
              view === option.value ? "bg-navy text-white" : "text-muted"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {view === "mois" ? (
        <>
          <div className="rounded-xl border border-line bg-white p-3 shadow-card">
            <div className="mb-2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => goToMonth(-1)}
                aria-label="Mois précédent"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-navy active:bg-cream"
              >
                <ChevronLeft size={20} />
              </button>
              <p className="min-w-0 flex-1 truncate text-center font-semibold text-navy">
                {formatMonthLabel(month)}
              </p>
              <button
                type="button"
                onClick={() => {
                  setMonth(startOfMonth(new Date()));
                  setSelectedDay(todayKey());
                }}
                className="shrink-0 rounded-lg border border-line px-2 py-1.5 text-xs font-medium text-muted"
              >
                Aujourd'hui
              </button>
              <button
                type="button"
                onClick={() => goToMonth(1)}
                aria-label="Mois suivant"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-navy active:bg-cream"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="grid grid-cols-7 text-center text-xs font-medium text-muted">
              {WEEKDAYS.map((weekday, index) => (
                <span key={index} className="py-1">
                  {weekday}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {cells.map((cell) => (
                <DayCell
                  key={cell.key}
                  cell={cell}
                  entries={entriesByDay.get(cell.key)}
                  selected={cell.key === selectedDay}
                  isToday={cell.key === todayKey()}
                  onSelect={() => selectDay(cell)}
                />
              ))}
            </div>
          </div>

          <section className="mt-5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h2 className="min-w-0 truncate text-sm font-semibold text-navy">
                {formatDayLabel(selectedDay)}
              </h2>
              <button
                type="button"
                onClick={() => openNew(selectedDay)}
                className="flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-lg bg-gold px-3 text-sm font-medium text-white"
              >
                <Plus size={16} /> Ajouter
              </button>
            </div>

            {dayEntries.length === 0 ? (
              <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-muted">
                Rien de prévu ce jour-là.
              </p>
            ) : (
              <ul className="space-y-3">
                {dayEntries.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    onOpenEvent={openEvent}
                    onOpenVisit={onSelectVisit}
                  />
                ))}
              </ul>
            )}
          </section>
        </>
      ) : (
        <section>
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-navy">Prochains rendez-vous</h2>
            <button
              type="button"
              onClick={() => openNew(selectedDay || todayKey())}
              className="flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-lg bg-gold px-3 text-sm font-medium text-white"
            >
              <Plus size={16} /> Ajouter
            </button>
          </div>

          {upcoming.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <CalendarDays size={40} className="mb-3 text-line" />
              <p className="font-medium text-ink">Rien de prévu</p>
              <p className="mt-1 text-sm text-muted">
                Ajoutez les prochaines visites et les déménagements à venir.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {upcoming.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  showDate
                  onOpenEvent={openEvent}
                  onOpenVisit={onSelectVisit}
                />
              ))}
            </ul>
          )}
        </section>
      )}

      {editing && (
        <AgendaEventForm
          eventId={editing.eventId}
          initial={editing.initial}
          canDelete={editing.canDelete}
          user={user}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function DayCell({ cell, entries, selected, isToday, onSelect }) {
  const dots = (entries || []).slice(0, 3);

  let tone = "text-ink";
  if (selected) tone = "bg-navy font-semibold text-white";
  else if (isToday) tone = "bg-gold/15 font-semibold text-navy";
  else if (!cell.inMonth) tone = "text-muted/50";

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-lg text-sm ${tone}`}
    >
      {cell.day}
      <span className="flex h-1.5 items-center gap-0.5">
        {dots.map((entry) => (
          <span
            key={entry.id}
            className={`h-1.5 w-1.5 rounded-full ${
              selected ? "bg-white" : styleOf(entry).dot
            }`}
          />
        ))}
      </span>
    </button>
  );
}

function styleOf(entry) {
  return entry.kind === "visit" ? FICHE : agendaType(entry.event.type);
}

function EntryCard({ entry, showDate, onOpenEvent, onOpenVisit }) {
  const style = styleOf(entry);
  const isVisit = entry.kind === "visit";
  const source = isVisit ? entry.visit : entry.event;
  const title = source.clientNom || (isVisit ? "Client sans nom" : "Rendez-vous");
  const address = isVisit ? source.departAdresse : source.adresse;
  const phone = source.clientTel;

  return (
    <li className="flex items-stretch overflow-hidden rounded-xl border border-line bg-white shadow-card">
      <span className={`w-1.5 shrink-0 ${style.bar}`} aria-hidden="true" />
      <button
        type="button"
        onClick={() => (isVisit ? onOpenVisit(source) : onOpenEvent(source))}
        className="min-w-0 flex-1 p-3 text-left"
      >
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className={`rounded border px-1.5 py-0.5 text-xs ${style.chip}`}>
            {style.label}
          </span>
          {showDate && (
            <span className="text-xs font-medium text-muted">
              {formatShortDay(entry.day)}
            </span>
          )}
          {!isVisit && source.heure && (
            <span className="flex items-center gap-1 text-xs font-medium text-navy">
              <Clock size={12} /> {source.heure}
            </span>
          )}
        </div>
        <p className="truncate font-semibold text-navy">{title}</p>
        {address && (
          <p className="mt-0.5 flex items-center gap-1 text-sm text-muted">
            <MapPin size={13} className="shrink-0" />
            <span className="truncate">{address}</span>
          </p>
        )}
        {!isVisit && source.notes && (
          <p className="mt-1 line-clamp-2 text-sm text-muted">{source.notes}</p>
        )}
      </button>
      {phone && (
        <a
          href={`tel:${phone}`}
          aria-label={`Appeler ${title}`}
          className="flex w-14 shrink-0 items-center justify-center border-l border-line text-navy active:bg-cream"
        >
          <Phone size={18} />
        </a>
      )}
    </li>
  );
}
