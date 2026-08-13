import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { totalVolume } from "../constants";
import { deleteVisitPhotos } from "./photos";

export const VISITS = "visites";

/**
 * Reserves a document id before anything is written. Photos are taken while
 * the form is still a draft, so their storage paths need the final visit id
 * from the very first upload.
 */
export function newVisitId() {
  return doc(collection(db, VISITS)).id;
}

export async function saveVisit(visitId, form, user) {
  await setDoc(doc(db, VISITS, visitId), {
    ...form,
    volumeTotal: totalVolume(form.pieces),
    createdAt: serverTimestamp(),
    createdBy: user.uid,
    createdByEmail: user.email || "",
  });
}

export function subscribeToVisits(onVisits, onError) {
  const visitsQuery = query(collection(db, VISITS), orderBy("createdAt", "desc"));
  return onSnapshot(
    visitsQuery,
    (snapshot) =>
      onVisits(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }))),
    onError
  );
}

/** Owner-only. Storage first, so a failure there never orphans the photos. */
export async function deleteVisit(visitId) {
  await deleteVisitPhotos(visitId);
  await deleteDoc(doc(db, VISITS, visitId));
}
