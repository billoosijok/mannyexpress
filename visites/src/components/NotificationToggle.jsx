import { useEffect, useState } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";
import {
  enableNotifications,
  notificationState,
  refreshNotifications,
} from "../lib/notifications";
import { Spinner } from "./ui";

/**
 * The bell in the header. Asking for permission has to come from a tap —
 * browsers ignore a request made on load, and iOS refuses it outright unless
 * the app has been added to the home screen.
 */
export default function NotificationToggle({ user }) {
  const [state, setState] = useState(notificationState); // unsupported|off|on|denied
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    refreshNotifications(user);
  }, [user]);

  if (state === "unsupported") return null;

  async function handleClick() {
    if (busy) return;

    if (state === "denied") {
      setNote(
        "Les notifications sont bloquées pour cette application. Autorisez-les dans les réglages du téléphone (Réglages → Manny Express → Notifications)."
      );
      return;
    }
    if (state === "on") {
      setNote("Notifications activées sur ce téléphone.");
      return;
    }

    setNote("");
    setBusy(true);
    try {
      const next = await enableNotifications(user);
      setState(next);
      if (next === "on") setNote("C'est activé : vous serez prévenu des nouvelles fiches.");
      else if (next === "denied") setNote("Notifications refusées.");
      else {
        setNote(
          "Impossible d'activer les notifications ici. Sur iPhone, l'application doit être installée sur l'écran d'accueil."
        );
      }
    } catch {
      setNote("L'activation a échoué. Vérifiez la connexion et réessayez.");
    } finally {
      setBusy(false);
    }
  }

  const Icon = state === "on" ? BellRing : state === "denied" ? BellOff : Bell;

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label={
          state === "on" ? "Notifications activées" : "Activer les notifications"
        }
        className={`flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg
          active:bg-white/15 ${state === "on" ? "text-gold" : "text-white/80"}`}
      >
        {busy ? <Spinner /> : <Icon size={18} />}
      </button>

      {note && (
        <p className="basis-full pb-2 text-xs text-white/80" role="status">
          {note}
        </p>
      )}
    </>
  );
}
