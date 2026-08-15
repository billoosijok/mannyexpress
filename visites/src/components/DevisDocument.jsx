import { useEffect, useRef, useState } from "react";
import { ENTREPRISE, formuleByValue } from "../constants";
import { devisTotals, formatDateFr, formatEuros, parseMontant } from "../lib/devis";
import "../devis.css";

// La largeur de la feuille, en pixels, telle que le CSS la dessine. À l'écran
// elle est réduite pour tenir dans la colonne ; à l'impression elle disparaît
// au profit de la largeur de la page A4.
const DEVIS_WIDTH = 760;

function Etape({ titre, date, adresse, etage, ascenseur, surface }) {
  return (
    <>
      <p className="devis-etape">
        {titre}
        {date ? ` : ${formatDateFr(date)}` : ""}
      </p>
      <ul className="devis-details">
        {adresse && <li>{adresse}</li>}
        {etage && (
          <li>
            <b>Étage :</b> {etage}
          </li>
        )}
        {ascenseur && (
          <li>
            <b>Ascenseur :</b> {ascenseur}
          </li>
        )}
        {surface && (
          <li>
            <b>Surface :</b> {surface} m²
          </li>
        )}
      </ul>
    </>
  );
}

/**
 * Le devis tel qu'il s'imprime : la feuille A4, à l'identique du devis papier.
 * Rien ne s'y saisit — tout vient du formulaire — et rien n'y est masqué :
 * ce qui est à l'écran est ce qui sort de l'imprimante.
 */
export default function DevisDocument({ devis, frameRef }) {
  const pageRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [frameHeight, setFrameHeight] = useState(null);

  // La feuille est mise à l'échelle de la colonne du téléphone, et son cadre
  // prend la hauteur réduite : sans cela il garderait celle de l'A4 entier et
  // laisserait un grand vide sous le devis.
  useEffect(() => {
    const page = pageRef.current;
    const frame = frameRef?.current || page?.parentElement;
    if (!page || !frame) return undefined;

    function measure() {
      const available = frame.clientWidth || DEVIS_WIDTH;
      const next = Math.min(1, available / DEVIS_WIDTH);
      setScale(next);
      setFrameHeight(page.scrollHeight * next);
    }

    measure();
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(page);
    observer?.observe(frame);
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [frameRef, devis]);

  const formule = formuleByValue(devis.formule);
  const { ht, tva, ttc } = devisTotals(devis);
  const prestations = String(devis.prestations || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const etapes = [
    {
      titre: "Chargement des meubles",
      date: devis.chargementDate,
      adresse: devis.chargementAdresse,
      etage: devis.chargementEtage,
      ascenseur: devis.chargementAscenseur,
      surface: devis.chargementSurface,
    },
    {
      titre: "Déchargement des meubles",
      date: devis.dechargementDate,
      adresse: devis.dechargementAdresse,
      etage: devis.dechargementEtage,
      ascenseur: devis.dechargementAscenseur,
      surface: devis.dechargementSurface,
    },
  ].filter((etape) => Object.values(etape).some((value) => String(value ?? "").trim()));

  return (
    <div
      ref={frameRef}
      className="devis-cadre"
      style={frameHeight ? { height: frameHeight } : undefined}
    >
      <div
        ref={pageRef}
        className="devis-page"
        style={{ transform: `scale(${scale})` }}
      >
        <div className="devis-bar" />

        <div className="devis-body">
          <header className="devis-head">
            <div className="devis-brand">
              <img className="devis-logo" src="/logo.png" alt="" />
              <div>
                <p className="devis-nom">{ENTREPRISE.nom}</p>
                <p className="devis-activite">{ENTREPRISE.activite}</p>
              </div>
            </div>
            <address className="devis-contact">
              {ENTREPRISE.adresse.map((ligne) => (
                <div key={ligne}>{ligne}</div>
              ))}
              {ENTREPRISE.telephones.map((numero) => (
                <div key={numero}>Tel : {numero}</div>
              ))}
              <div>Mail : {ENTREPRISE.email}</div>
            </address>
          </header>

          <h1 className="devis-titre">Devis N° {devis.numero}</h1>

          <div className="devis-parties">
            <div>
              <p className="devis-etiquette">Devis pour</p>
              {devis.clientNom && <p className="devis-ligne">Nom : {devis.clientNom}</p>}
              {devis.clientTel && (
                <p className="devis-ligne">Téléphone : {devis.clientTel}</p>
              )}
              {devis.clientEmail && (
                <p className="devis-ligne">Email : {devis.clientEmail}</p>
              )}
            </div>
            <div className="devis-dates">
              <div className="devis-date-bloc">
                <p className="devis-etiquette">Date</p>
                <p className="devis-ligne">{formatDateFr(devis.date)}</p>
              </div>
              {devis.envoyeeLe && (
                <div className="devis-date-bloc">
                  <p className="devis-etiquette">Envoyé le</p>
                  <p className="devis-ligne">{formatDateFr(devis.envoyeeLe)}</p>
                </div>
              )}
            </div>
          </div>

          <table className="devis-table">
            <thead>
              <tr>
                <th>Description</th>
                <th className="devis-col-qte">Qté</th>
                <th className="devis-col-prix">
                  Prix total
                  <span className="devis-ttc">(TTC)</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {etapes.map((etape, index) => (
                <tr key={etape.titre}>
                  <td>
                    <Etape {...etape} />
                  </td>
                  {/* Une seule prestation, chiffrée d'un bloc : la quantité et
                      le prix sont portés par la première ligne. */}
                  <td className="devis-qte">{index === 0 ? "1" : ""}</td>
                  <td className="devis-prix">{index === 0 ? formatEuros(ttc) : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <section className="devis-formule">
            <h3>
              Prestation complète — Formule {formule.label}
              {devis.volume ? ` ${devis.volume} m³` : ""}
            </h3>
            <ul>
              {prestations.map((ligne, index) => (
                <li key={`${index}-${ligne}`}>{ligne}</li>
              ))}
            </ul>
            {devis.conditions && <p className="devis-conditions">{devis.conditions}</p>}
          </section>

          <div className="devis-pied">
            <div className="devis-signatures">
              <div>
                {ENTREPRISE.ville} le {formatDateFr(devis.date)}
                <br />
                La direction
              </div>
              <div>
                Signature du client
                <br />
                Bon pour accord
              </div>
            </div>
            <table className="devis-totaux">
              <tbody>
                <tr>
                  <td>Total HT</td>
                  <td>{formatEuros(ht)}</td>
                </tr>
                <tr>
                  <td>TVA</td>
                  <td>{formatEuros(tva)}</td>
                </tr>
                <tr className="devis-total-fort">
                  <td>Total (TTC)</td>
                  <td>{formatEuros(ttc)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <p className="devis-legal">
          {ENTREPRISE.nom} — SIRET {ENTREPRISE.siret} — Siège social :{" "}
          {ENTREPRISE.siege}
          <br />
          {parseMontant(devis.tauxTva) === 0 && `${ENTREPRISE.mentionTva} `}
          Devis gratuit, valable 30 jours à compter de sa date d'émission.
        </p>
      </div>
    </div>
  );
}
