import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

export const AGENDA = "agenda";

export async function createEvent(form, user) {
  await addDoc(collection(db, AGENDA), {
    ...form,
    createdAt: serverTimestamp(),
    createdBy: user.uid,
    createdByEmail: user.email || "",
  });
}

/** Appointments move around, so unlike a visit sheet an event stays editable. */
export async function updateEvent(eventId, form) {
  await updateDoc(doc(db, AGENDA, eventId), {
    ...form,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteEvent(eventId) {
  await deleteDoc(doc(db, AGENDA, eventId));
}

/**
 * Ordering on the day alone: sorting on the hour too would need a composite
 * index, and the calendar sorts a single day's entries itself.
 */
export function subscribeToAgenda(onEvents, onError) {
  const agendaQuery = query(collection(db, AGENDA), orderBy("date"));
  return onSnapshot(
    agendaQuery,
    (snapshot) =>
      onEvents(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }))),
    onError
  );
}
