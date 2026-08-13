import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { db } from "../firebase";

/**
 * Push notifications: when someone records a visit or an appointment, the
 * other phones are told about it.
 *
 * One document per phone, keyed by its registration token, in `tokens`. The
 * Cloud Function reads them all and skips the one belonging to whoever did
 * the recording. A phone that reinstalls the app gets a new token; the stale
 * one is dropped by the function the first time it fails.
 *
 * On iOS this only works once the app is on the home screen — Safari refuses
 * push to a page in a tab — and the permission must be asked from a tap,
 * never on load.
 */
export const TOKENS = "tokens";

/** Local knowledge only; asking the server would tell us nothing useful. */
export function notificationState() {
  if (typeof Notification === "undefined" || !("serviceWorker" in navigator)) {
    return "unsupported";
  }
  if (Notification.permission === "granted") return "on";
  if (Notification.permission === "denied") return "denied";
  return "off";
}

async function messaging() {
  if (!(await isSupported())) return null;
  return getMessaging();
}

async function registerToken(user) {
  const service = await messaging();
  if (!service) return false;

  // The app's own service worker receives the pushes; a second one just for
  // messaging would fight it for the scope. `ready` never settles when there
  // is no worker at all — in development, or if registration failed — and the
  // bell would spin for ever, so it is given a deadline.
  const registration = await Promise.race([
    navigator.serviceWorker.ready,
    new Promise((resolve) => setTimeout(() => resolve(null), 5000)),
  ]);
  if (!registration) return false;
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  const token = await getToken(service, {
    serviceWorkerRegistration: registration,
    ...(vapidKey ? { vapidKey } : {}),
  });
  if (!token) return false;

  await setDoc(doc(db, TOKENS, token), {
    uid: user.uid,
    email: user.email || "",
    updatedAt: serverTimestamp(),
  });
  return true;
}

/** Asks, then registers. Must be called straight from a tap. */
export async function enableNotifications(user) {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return permission === "denied" ? "denied" : "off";
  return (await registerToken(user)) ? "on" : "off";
}

/**
 * Keeps the registration fresh on a phone that already said yes. Tokens are
 * rotated by the browser, and a stale one is a phone that stops being told.
 */
export async function refreshNotifications(user) {
  if (notificationState() !== "on") return;
  try {
    await registerToken(user);
  } catch {
    // Nothing to tell the user: they asked for nothing, and the app works.
  }
}
