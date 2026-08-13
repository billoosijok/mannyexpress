/**
 * Service-worker plumbing. Kept out of the components: the only thing the UI
 * needs to know is "a new version is ready" and "switch to it now".
 */

/** Calls back with the waiting worker whenever a new version is ready. */
export function registerServiceWorker(onWaiting) {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;

  navigator.serviceWorker
    .register("/sw.js")
    .then((registration) => {
      if (registration.waiting) onWaiting(registration.waiting);

      registration.addEventListener("updatefound", () => {
        const installing = registration.installing;
        if (!installing) return;
        installing.addEventListener("statechange", () => {
          // "installed" with a controller in place means this is a new
          // version standing behind the running one, not the first install.
          if (installing.state === "installed" && navigator.serviceWorker.controller) {
            onWaiting(installing);
          }
        });
      });

      // Reopening the app is the moment a new deployment is most likely to
      // have landed; the browser only checks on its own once every day.
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") registration.update().catch(() => {});
      });
    })
    .catch(() => {
      // An app that fails to register still works, it just loses offline use.
    });
}

/** Hands over to the waiting version and reloads once it has taken control. */
export function activateUpdate(worker) {
  navigator.serviceWorker.addEventListener(
    "controllerchange",
    () => window.location.reload(),
    { once: true }
  );
  worker.postMessage("skip-waiting");
}
