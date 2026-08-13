import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { applyUpdateNow, startUpdateWatch, subscribeToUpdates } from "../lib/updates";

/**
 * New versions install themselves as soon as doing so disturbs nobody, so
 * this banner only ever appears in front of someone who is in the middle of
 * something — filling a sheet, sending a photo. It is the way to take the
 * update anyway, without waiting to be finished.
 */
export default function UpdateBanner() {
  const [pending, setPending] = useState(false);

  useEffect(() => {
    startUpdateWatch();
    return subscribeToUpdates(setPending);
  }, []);

  if (!pending) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gold bg-navy pb-[env(safe-area-inset-bottom)] text-white">
      <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-3">
        <p className="min-w-0 flex-1 text-sm">
          Nouvelle version disponible.
          <span className="block text-xs text-white/70">
            La fiche en cours est conservée.
          </span>
        </p>
        <button
          type="button"
          onClick={applyUpdateNow}
          className="flex min-h-[44px] shrink-0 items-center gap-2 rounded-lg bg-gold px-3 text-sm font-semibold"
        >
          <RefreshCw size={16} /> Mettre à jour
        </button>
      </div>
    </div>
  );
}
