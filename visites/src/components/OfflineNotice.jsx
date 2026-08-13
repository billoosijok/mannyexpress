import { useEffect, useState } from "react";
import { CloudOff } from "lucide-react";

function useIsOnline() {
  const [online, setOnline] = useState(() => navigator.onLine !== false);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine !== false);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return online;
}

/**
 * Sits under the header while the phone has no connection. Saying what still
 * works matters as much as saying what does not: the fiche is safe, the
 * photos are the part that has to wait.
 */
export default function OfflineNotice() {
  const online = useIsOnline();
  if (online) return null;

  return (
    // Opaque on purpose: this strip sits inside the navy header, so a
    // translucent background would leave the text unreadable.
    <div className="flex items-start gap-2 bg-amber-100 px-4 py-2 text-xs text-amber-900">
      <CloudOff size={15} className="mt-0.5 shrink-0" />
      <p>
        <span className="font-semibold">Hors connexion.</span> Les fiches et les
        rendez-vous sont enregistrés sur le téléphone et envoyés dès le retour du
        réseau. Les photos, elles, ont besoin d'une connexion.
      </p>
    </div>
  );
}
