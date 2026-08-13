import { useState } from "react";
import { Check, Trash2, X } from "lucide-react";
import { AGENDA_TYPES } from "../constants";
import { createEvent, deleteEvent, updateEvent } from "../lib/agenda";
import { formatDayLabel } from "../lib/format";
import { ErrorNote, Field, Spinner, TextArea, TextInput } from "./ui";

/**
 * Full-screen sheet over the calendar. `eventId` is null when adding, set when
 * an existing entry is being edited.
 */
export default function AgendaEventForm({ eventId, initial, canDelete, user, onClose }) {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState("idle"); // idle | saving | deleting
  const [error, setError] = useState("");

  const busy = status !== "idle";

  const setValue = (key) => (value) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  async function handleSubmit(event) {
    event.preventDefault();
    if (busy) return;

    if (!form.date) {
      setError("La date est obligatoire.");
      return;
    }

    setError("");
    setStatus("saving");
    try {
      if (eventId) {
        await updateEvent(eventId, form);
      } else {
        await createEvent(form, user);
      }
      onClose();
    } catch {
      setStatus("idle");
      setError("L'enregistrement a échoué. Vérifiez la connexion et réessayez.");
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Supprimer ${form.clientNom ? `le rendez-vous de ${form.clientNom}` : "ce rendez-vous"} du ${formatDayLabel(form.date).toLowerCase()} ?`
    );
    if (!confirmed) return;

    setError("");
    setStatus("deleting");
    try {
      await deleteEvent(eventId);
      onClose();
    } catch {
      setStatus("idle");
      setError("La suppression a échoué. Réessayez.");
    }
  }

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-cream pt-[env(safe-area-inset-top)]">
      <form onSubmit={handleSubmit} className="mx-auto max-w-md px-4 pb-10 pt-3">
        <div className="mb-4 flex items-center gap-2">
          <h2 className="flex-1 text-base font-semibold text-navy">
            {eventId ? "Modifier le rendez-vous" : "Nouveau rendez-vous"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-lg text-muted"
          >
            <X size={22} />
          </button>
        </div>

        {error && (
          <div className="mb-4">
            <ErrorNote>{error}</ErrorNote>
          </div>
        )}

        <div className="rounded-xl border border-line bg-white p-4 shadow-card">
          <span className="mb-1 block text-sm font-medium text-ink">Type</span>
          <div className="mb-3 flex gap-2">
            {AGENDA_TYPES.map((type) => {
              const selected = form.type === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setValue("type")(type.value)}
                  className={`min-h-[44px] flex-1 rounded-lg border px-3 text-sm transition ${
                    selected
                      ? "border-gold bg-gold text-white"
                      : "border-line bg-white text-ink"
                  }`}
                >
                  {type.label}
                </button>
              );
            })}
          </div>

          <Field label="Date" required>
            <TextInput type="date" value={form.date} onChange={setValue("date")} />
          </Field>
          <Field label="Heure" hint="Laisser vide si l'heure n'est pas encore fixée">
            <TextInput type="time" value={form.heure} onChange={setValue("heure")} />
          </Field>
          <Field label="Client">
            <TextInput
              value={form.clientNom}
              onChange={setValue("clientNom")}
              placeholder="Ex : Dupont Marie"
            />
          </Field>
          <Field label="Téléphone">
            <TextInput type="tel" value={form.clientTel} onChange={setValue("clientTel")} />
          </Field>
          <Field label="Adresse">
            <TextInput
              value={form.adresse}
              onChange={setValue("adresse")}
              placeholder="Ex : 12 rue des Lilas, Créteil"
            />
          </Field>
          <Field label="Notes">
            <TextArea value={form.notes} onChange={setValue("notes")} rows={3} />
          </Field>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="mt-4 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-gold text-base font-semibold text-white transition disabled:opacity-70"
        >
          {status === "saving" ? <Spinner /> : <Check size={20} />}
          {status === "saving" ? "Enregistrement..." : "Enregistrer"}
        </button>

        {eventId && canDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={busy}
            className="mt-3 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 font-medium text-red-700 disabled:opacity-60"
          >
            {status === "deleting" ? <Spinner /> : <Trash2 size={18} />}
            {status === "deleting" ? "Suppression..." : "Supprimer le rendez-vous"}
          </button>
        )}
      </form>
    </div>
  );
}
