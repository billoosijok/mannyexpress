import {
  deleteObject,
  getDownloadURL,
  listAll,
  ref,
  uploadBytes,
} from "firebase/storage";
import { storage } from "../firebase";

export function visitFolder(visitId) {
  return `visites/${visitId}`;
}

export function pieceFolder(visitId, pieceId) {
  return `visites/${visitId}/pieces/${pieceId}`;
}

export function objetsValeurFolder(visitId) {
  return `visites/${visitId}/objetsValeur`;
}

export function objetsPianoFolder(visitId) {
  return `visites/${visitId}/objetsPiano`;
}

export function supplementairesFolder(visitId) {
  return `visites/${visitId}/supplementaires`;
}

export async function uploadPhoto(blob, path) {
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, blob, { contentType: "image/jpeg" });
  return getDownloadURL(fileRef);
}

export async function deletePhoto(url) {
  try {
    await deleteObject(ref(storage, url));
  } catch (error) {
    // A photo removed twice, or never fully uploaded, is not a failure.
    if (error?.code !== "storage/object-not-found") throw error;
  }
}

/** Recursively empties a visit's storage folder. */
export async function deleteVisitPhotos(visitId) {
  async function emptyFolder(folderRef) {
    const listing = await listAll(folderRef);
    await Promise.all(listing.items.map((item) => deleteObject(item)));
    await Promise.all(listing.prefixes.map(emptyFolder));
  }

  try {
    await emptyFolder(ref(storage, visitFolder(visitId)));
  } catch (error) {
    if (error?.code !== "storage/object-not-found") throw error;
  }
}
