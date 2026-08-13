import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { activateUpdate, registerServiceWorker } from "../lib/pwa";

/**
 * Registers the service worker and, when a newer version is waiting behind
 * the running one, offers to switch over. The switch is never automatic: it
 * reloads the page, which would throw away a half-filled visit sheet.
 */
export default function UpdateBanner({ warnAboutDraft = true }) {
  const [waiting, setWaiting] = useState(null);

  useEffect(() => registerServiceWorker(setWaiting), []);

  if (!waiting) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gold bg-navy pb-[env(safe-area-inset-bottom)] text-white">
      <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-3">
        <p className="min-w-0 flex-1 text-sm">
          Nouvelle version disponible.
          {warnAboutDraft && (
            <span className="block text-xs text-white/70">
              La fiche en cours de saisie sera perdue.
            </span>
          )}
        </p>
        <button
          type="button"
          onClick={() => activateUpdate(waiting)}
          className="flex min-h-[44px] shrink-0 items-center gap-2 rounded-lg bg-gold px-3 text-sm font-semibold"
        >
          <RefreshCw size={16} /> Mettre à jour
        </button>
      </div>
    </div>
  );
}
