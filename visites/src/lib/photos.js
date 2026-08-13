import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase";
import { visitPhotoUrls } from "../constants";

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

/**
 * Deletes the photos a visit points at, one by one.
 *
 * Listing the visit's folder instead would need read access to the folder
 * path itself — `visites/{id}`, which storage.rules does not cover: its rule
 * starts one segment below. Going by the URLs kept in the sheet asks for
 * nothing the app is not already allowed to do, and removes exactly the
 * photos that sheet was showing.
 */
export async function deleteVisitPhotos(visit) {
  await Promise.all(visitPhotoUrls(visit).map(deletePhoto));
}
