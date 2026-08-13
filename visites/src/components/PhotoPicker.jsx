import { useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { compressImage } from "../lib/compress";
import { deletePhoto, uploadPhoto } from "../lib/photos";
import { uid } from "../constants";
import { ErrorNote, Spinner } from "./ui";

/**
 * Capture + upload widget. Photos land in Storage immediately and only their
 * download URLs are kept in state, so the visit document never carries image
 * data.
 *
 * `onChange` receives an updater `(previousUrls) => nextUrls`: uploads resolve
 * one after another and each one must build on the list as it stands then.
 */
export default function PhotoPicker({ folder, urls = [], onChange, label = "Ajouter des photos" }) {
  const inputRef = useRef(null);
  const [pending, setPending] = useState(0);
  const [error, setError] = useState("");

  async function handleFiles(event) {
    const files = Array.from(event.target.files || []);
    // Lets the same photo be picked twice in a row.
    event.target.value = "";
    if (files.length === 0) return;

    setError("");
    setPending((count) => count + files.length);

    for (const file of files) {
      try {
        const blob = await compressImage(file);
        const url = await uploadPhoto(blob, `${folder}/${uid()}.jpg`);
        onChange((previous) => [...previous, url]);
      } catch {
        // Only the failed photo is dropped; the rest of the form is untouched.
        setError("Une photo n'a pas pu être envoyée. Réessayez.");
      } finally {
        setPending((count) => count - 1);
      }
    }
  }

  async function removePhoto(url) {
    onChange((previous) => previous.filter((item) => item !== url));
    try {
      await deletePhoto(url);
    } catch {
      // The thumbnail is already gone from the form; a leftover file in
      // Storage is not worth interrupting the surveyor for.
    }
  }

  return (
    <div className="mb-3">
      <div className="flex flex-wrap gap-2">
        {urls.map((url) => (
          <div key={url} className="relative h-16 w-16">
            <img
              src={url}
              alt=""
              className="h-16 w-16 rounded-lg border border-line object-cover"
            />
            <button
              type="button"
              onClick={() => removePhoto(url)}
              aria-label="Supprimer la photo"
              className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-line bg-white text-ink shadow-card"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {Array.from({ length: pending }).map((_, index) => (
          <div
            key={`pending-${index}`}
            className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-line bg-cream text-gold"
          >
            <Spinner className="h-5 w-5" />
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-gold/60 bg-gold/5 text-gold"
        >
          <Camera size={20} />
          <span className="text-[10px] leading-none">Photo</span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleFiles}
        className="hidden"
        aria-label={label}
      />

      {error && (
        <div className="mt-2">
          <ErrorNote>{error}</ErrorNote>
        </div>
      )}
    </div>
  );
}
