import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ClipboardList, LogOut, Plus, Truck } from "lucide-react";
import { auth } from "./firebase";
import LoginScreen from "./components/LoginScreen";
import VisitForm from "./components/VisitForm";
import VisitsList from "./components/VisitsList";
import VisitDetail from "./components/VisitDetail";
import { Spinner } from "./components/ui";

export default function App() {
  const [user, setUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [authResolved, setAuthResolved] = useState(false);
  const [tab, setTab] = useState("nouvelle");
  const [selectedVisit, setSelectedVisit] = useState(null);

  useEffect(() => {
    return onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (nextUser) {
        try {
          const token = await nextUser.getIdTokenResult();
          setIsOwner(token.claims.role === "owner");
        } catch {
          setIsOwner(false);
        }
      } else {
        setIsOwner(false);
        setSelectedVisit(null);
      }
      setAuthResolved(true);
    });
  }, []);

  // Showing the login form before auth resolves makes it flash on every reload.
  if (!authResolved) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream text-gold">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!user) return <LoginScreen />;

  return (
    <div className="min-h-screen bg-cream">
      {/* The web app draws under the system status bar (viewport-fit=cover +
          black-translucent), so the header has to reserve that height itself —
          without it the clock and battery sit on top of the logout button. */}
      <header className="sticky top-0 z-30 bg-navy pt-[env(safe-area-inset-top)] text-white">
        <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-3">
          <Truck size={26} className="shrink-0 text-gold" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold leading-tight tracking-wide">
              MANNY EXPRESS
            </p>
            <p className="truncate text-xs text-white/70">Fiches de visite terrain</p>
          </div>
          <button
            type="button"
            onClick={() => signOut(auth)}
            className="-mr-2 flex min-h-[44px] min-w-[44px] shrink-0 items-center
              justify-center gap-1.5 rounded-lg px-2 text-xs text-white/80
              active:bg-white/15"
            aria-label="Se déconnecter"
          >
            <span className="hidden max-w-[120px] truncate sm:inline">{user.email}</span>
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Bottom padding clears the sticky submit bar and the tab bar. */}
      <main className="mx-auto max-w-md px-4 pb-40 pt-4">
        {/* The form stays mounted behind the other views: opening the list or
            a past visit must not throw away a half-filled draft or its
            uploaded photos. */}
        <div className={tab === "nouvelle" && !selectedVisit ? "" : "hidden"}>
          <VisitForm user={user} />
        </div>
        <div className={tab === "visites" && !selectedVisit ? "" : "hidden"}>
          <VisitsList onSelect={setSelectedVisit} />
        </div>
        {selectedVisit && (
          <VisitDetail
            visit={selectedVisit}
            isOwner={isOwner}
            onBack={() => setSelectedVisit(null)}
          />
        )}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white">
        <div className="mx-auto flex max-w-md">
          <TabButton
            active={tab === "nouvelle" && !selectedVisit}
            onClick={() => {
              setSelectedVisit(null);
              setTab("nouvelle");
            }}
            icon={<Plus size={20} />}
            label="Nouvelle visite"
          />
          <TabButton
            active={tab === "visites" || Boolean(selectedVisit)}
            onClick={() => {
              setSelectedVisit(null);
              setTab("visites");
            }}
            icon={<ClipboardList size={20} />}
            label="Visites"
          />
        </div>
      </nav>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium ${
        active ? "text-gold" : "text-muted"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
