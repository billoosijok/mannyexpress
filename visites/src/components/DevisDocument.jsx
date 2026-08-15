import { useEffect, useRef, useState } from "react";
import { ENTREPRISE, formuleByValue } from "../constants";
import { devisMontant, formatDateFr, formatEuros } from "../lib/devis";
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
  const montant = devisMontant(devis);
  const lignes = (text) =>
    String(text || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  const prestations = lignes(devis.prestations);
  const charge = lignes(devis.charge);

  const etapes = [
    {
      titre: devis.chargementTitre || "Chargement des meubles",
      date: devis.chargementDate,
      adresse: devis.chargementAdresse,
      etage: devis.chargementEtage,
      ascenseur: devis.chargementAscenseur,
      surface: devis.chargementSurface,
    },
    {
      titre: devis.dechargementTitre || "Déchargement des meubles",
      date: devis.dechargementDate,
      adresse: devis.dechargementAdresse,
      etage: devis.dechargementEtage,
      ascenseur: devis.dechargementAscenseur,
      surface: devis.dechargementSurface,
    },
    // L'intitulé ne compte pas : il est toujours rempli. Une étape sans date
    // ni adresse ni accès ne s'imprime pas, plutôt qu'un titre tout seul.
  ].filter(({ titre: _titre, ...details }) =>
    Object.values(details).some((value) => String(value ?? "").trim())
  );

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
                  <td className="devis-prix">{index === 0 ? formatEuros(montant) : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <section className="devis-formule">
            <h3>
              Formule {formule.label}
              {devis.volume ? ` — ${devis.volume} m³` : ""}
            </h3>
            <div
              className={`devis-listes${charge.length === 0 ? " devis-listes-seule" : ""}`}
            >
              <div>
                <p className="devis-liste-titre">Compris dans la formule</p>
                <ul className="devis-inclus">
                  {prestations.map((ligne, index) => (
                    <li key={`${index}-${ligne}`}>{ligne}</li>
                  ))}
                </ul>
              </div>
              {/* La formule Luxe ne laisse rien au client : la colonne
                  disparaît alors au lieu de s'afficher vide. */}
              {charge.length > 0 && (
                <div>
                  <p className="devis-liste-titre">Non compris, à votre charge</p>
                  <ul className="devis-charge">
                    {charge.map((ligne, index) => (
                      <li key={`${index}-${ligne}`}>{ligne}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
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
            {/* Micro-entreprise : un seul montant, et la mention qui tient
                lieu de ligne de TVA. */}
            <div className="devis-totaux">
              <div className="devis-total-fort">
                <span>Total à régler</span>
                <span>{formatEuros(montant)}</span>
              </div>
              <p className="devis-total-mention">{ENTREPRISE.mentionTva}</p>
            </div>
          </div>
        </div>

        <p className="devis-legal">
          {ENTREPRISE.nom} — SIRET {ENTREPRISE.siret} — Siège social :{" "}
          {ENTREPRISE.siege}
          <br />
          Devis gratuit, valable 30 jours à compter de sa date d'émission.
        </p>
      </div>
    </div>
  );
}
