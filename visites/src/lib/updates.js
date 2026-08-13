/**
 * Keeping the installed app on the deployment that is currently online.
 *
 * A new version is looked for when the app comes back to the front, when the
 * network returns, and once a minute while it is open — the browser's own
 * check happens about once a day, which is nowhere near enough.
 *
 * Taking a new version means reloading the page, so it happens by itself
 * whenever that costs nothing: while the app is in the background, or in
 * front of someone who is not in the middle of something. The half-filled
 * sheet is kept on the phone (lib/draft.js), which is what makes an unasked
 * reload harmless in the first place. The banner is only the way out for the
 * one case left: someone typing, right now, who would rather not be
 * interrupted.
 */

const POLL_MS = 60_000;

let started = false;
let registration = null;
let waiting = null; // a new version, installed, standing behind this one
let mustReload = false; // another tab already switched over
let reloading = false;

const blockers = new Set(); // work a reload would destroy
const deferrals = new Set(); // work a reload would merely interrupt
const listeners = new Set();

function anyOf(guards) {
  for (const isBusy of guards) {
    if (isBusy()) return true;
  }
  return false;
}

function notify() {
  const pending = Boolean(waiting || mustReload) && !reloading;
  for (const listener of listeners) listener(pending);
}

/**
 * Registers work that a reload would lose — a photo on its way to Storage,
 * a form whose contents are not written down anywhere. Returns the release.
 */
export function blockUpdates(isBusy) {
  blockers.add(isBusy);
  return () => {
    blockers.delete(isBusy);
    settle();
  };
}

/** Registers work a reload would only interrupt, such as a saved-as-you-go form. */
export function deferUpdates(isBusy) {
  deferrals.add(isBusy);
  return () => {
    deferrals.delete(isBusy);
    settle();
  };
}

/**
 * Called when a piece of work ends — a sheet saved, a form emptied. Guards are
 * read when a decision is made, not when they change, so finishing something
 * has to say so for a waiting version to go in straight away.
 */
export function settleUpdates() {
  settle();
}

export function subscribeToUpdates(listener) {
  listeners.add(listener);
  notify();
  return () => listeners.delete(listener);
}

/** What the banner's button does: the user asked, so no guard applies. */
export function applyUpdateNow() {
  apply(true);
}

function apply(forced) {
  if (reloading) return;
  if (!forced) {
    if (anyOf(blockers)) return;
    // Out of sight there is nobody to interrupt.
    if (document.visibilityState === "visible" && anyOf(deferrals)) return;
  }

  if (mustReload) {
    reloading = true;
    window.location.reload();
    return;
  }
  if (waiting) {
    reloading = true;
    // The switch-over lands back here as a controllerchange, which reloads.
    waiting.postMessage("skip-waiting");
  }
}

function settle() {
  if (waiting || mustReload) apply(false);
}

function found(worker) {
  waiting = worker;
  // Settled first: when the update goes in by itself there is no moment where
  // the banner is on screen.
  settle();
  notify();
}

function checkNow() {
  registration?.update().catch(() => {});
}

export function startUpdateWatch() {
  if (started || !import.meta.env.PROD || !("serviceWorker" in navigator)) return;
  started = true;

  // A page that starts without a controller is the very first install. The
  // claim that follows is not a new version and must not reload anything —
  // but every controllerchange after that one is a real switch-over.
  let controlled = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!controlled) {
      controlled = true;
      return;
    }
    if (reloading) {
      window.location.reload();
      return;
    }
    // Another tab switched over: this one is now running a version that is no
    // longer the one on the server.
    mustReload = true;
    settle();
    notify();
  });

  navigator.serviceWorker
    .register("/sw.js")
    .then((current) => {
      registration = current;
      if (current.waiting) found(current.waiting);

      current.addEventListener("updatefound", () => {
        const installing = current.installing;
        if (!installing) return;
        installing.addEventListener("statechange", () => {
          // "installed" while a controller is in place means a new version
          // behind the running one, not the first install.
          if (installing.state === "installed" && navigator.serviceWorker.controller) {
            found(installing);
          }
        });
      });

      checkNow();
    })
    .catch(() => {
      // An app that fails to register still works; it just loses offline use.
    });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") checkNow();
    // Going away is the best moment to switch over: nobody is looking.
    settle();
  });
  window.addEventListener("online", checkNow);
  setInterval(() => {
    if (document.visibilityState === "visible") checkNow();
  }, POLL_MS);
}
