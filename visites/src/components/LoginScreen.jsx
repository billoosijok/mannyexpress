import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Truck } from "lucide-react";
import { auth } from "../firebase";
import { ErrorNote, Spinner } from "./ui";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // The auth listener in App swaps the screen; nothing else to do here.
    } catch {
      // Firebase error codes stay out of the UI on purpose.
      setError("Email ou mot de passe incorrect.");
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-navy">
            <Truck size={32} className="text-gold" />
          </div>
          <h1 className="text-xl font-bold tracking-wide text-navy">MANNY EXPRESS</h1>
          <p className="mt-1 text-sm text-muted">Fiches de visite terrain</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="mb-3 block">
            <span className="mb-1 block text-sm font-medium text-ink">Email</span>
            <input
              className="field-input"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="mb-4 block">
            <span className="mb-1 block text-sm font-medium text-ink">Mot de passe</span>
            <input
              className="field-input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error && (
            <div className="mb-4">
              <ErrorNote>{error}</ErrorNote>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-gold text-base font-semibold text-white disabled:opacity-70"
          >
            {busy && <Spinner />}
            {busy ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
