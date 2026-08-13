/**
 * The visit sheet being filled in is kept on the phone, so reloading the page
 * never costs anything: a new version can then take over on its own, and a
 * crash, a closed tab or a flat battery no longer throw away an hour of work.
 *
 * Only what was typed is stored. Photos are already in Storage by then, and
 * the sheet holds their URLs, so they come back with it.
 */
const KEY = "manny-express.visite-brouillon";

export function readDraft() {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY));
    if (!stored?.visitId || !stored?.form?.pieces) return null;
    return stored;
  } catch {
    // Written by an older version of the app, or unreadable: start clean.
    return null;
  }
}

export function writeDraft(visitId, form) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ visitId, form }));
  } catch {
    // A full or blocked storage is not worth interrupting the surveyor for.
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing to do about it either.
  }
}
