/**
 * Firestore writes are durable as soon as they reach its local cache, but the
 * promise they return only settles when the server answers — offline it would
 * never resolve and the form would spin for ever. So offline the write is let
 * go: the SDK sends it as soon as the connection is back.
 *
 * Returns "envoye" when the server has acknowledged the write, "en-attente"
 * when it is queued on the phone.
 */
export async function commit(write) {
  if (navigator.onLine === false) {
    write.catch(() => {});
    return "en-attente";
  }
  await write;
  return "envoye";
}
