import { useEffect, useState } from "react";
import { ChevronRight, ClipboardList, MapPin } from "lucide-react";
import { subscribeToVisits } from "../lib/visits";
import { formatVisitDate } from "../lib/format";
import { ErrorNote, Spinner } from "./ui";

export default function VisitsList({ onSelect }) {
  const [visits, setVisits] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    return subscribeToVisits(
      (data) => {
        setError("");
        setVisits(data);
      },
      () => setError("Impossible de charger les visites. Vérifiez la connexion.")
    );
  }, []);

  if (error) {
    return (
      <div className="pt-6">
        <ErrorNote>{error}</ErrorNote>
      </div>
    );
  }

  if (visits === null) {
    return (
      <div className="flex justify-center py-16 text-gold">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (visits.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <ClipboardList size={40} className="mb-3 text-line" />
        <p className="font-medium text-ink">Aucune visite enregistrée</p>
        <p className="mt-1 text-sm text-muted">
          Les fiches remplies sur le terrain apparaîtront ici.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3 py-2">
      {visits.map((visit) => (
        <li key={visit.id}>
          <button
            type="button"
            onClick={() => onSelect(visit)}
            className="flex w-full items-center gap-3 rounded-xl border border-line bg-white p-4 text-left shadow-card"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-navy">
                {visit.clientNom || "Client sans nom"}
              </p>
              {visit.departAdresse && (
                <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-muted">
                  <MapPin size={13} className="shrink-0" />
                  <span className="truncate">{visit.departAdresse}</span>
                </p>
              )}
              <p className="mt-1 text-xs text-muted">
                {formatVisitDate(visit)}
                {visit.volumeTotal > 0 &&
                  ` · ${Number(visit.volumeTotal).toFixed(1)} m³`}
              </p>
            </div>
            <ChevronRight size={20} className="shrink-0 text-line" />
          </button>
        </li>
      ))}
    </ul>
  );
}
