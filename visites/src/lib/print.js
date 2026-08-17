import devisCss from "../devis.css?raw";

/**
 * La feuille A4 elle-même, qu'on lui passe son cadre d'aperçu ou la feuille.
 * Le cadre est ce que l'écran manipule — il porte la hauteur réduite et rogne
 * ce qui dépasse ; la feuille est ce qui s'imprime.
 */
export function devisSheet(node) {
  if (!node) return null;
  if (node.classList?.contains("devis-page")) return node;
  return node.querySelector?.(".devis-page") ?? null;
}

/**
 * Imprimer depuis l'application elle-même : la feuille de style bascule tout
 * le reste en invisible et ne laisse que le devis. C'est de là que vient le
 * PDF — la boîte d'impression de l'iPhone comme celle d'un ordinateur sait
 * l'enregistrer. Le titre du document devient le nom du fichier proposé.
 */
export function printNode(node, title) {
  if (!node) return;

  const previousTitle = document.title;
  // Tout ce qui n'est pas sur le chemin de la feuille est retiré de la page,
  // et ce qui la contient est débarrassé de ses marges : sinon l'imprimante
  // sort le devis suivi des pages blanches laissées par le reste de l'écran.
  const hidden = [];
  const parents = [];
  for (let child = node; child.parentElement; child = child.parentElement) {
    const parent = child.parentElement;
    for (const sibling of parent.children) {
      if (sibling !== child) {
        sibling.classList.add("devis-masque");
        hidden.push(sibling);
      }
    }
    if (parent !== document.body) {
      parent.classList.add("devis-parent-impression");
      parents.push(parent);
    }
  }
  document.title = title;

  let restored = false;
  function restore() {
    if (restored) return;
    restored = true;
    for (const element of hidden) element.classList.remove("devis-masque");
    for (const element of parents) element.classList.remove("devis-parent-impression");
    document.title = previousTitle;
    window.removeEventListener("afterprint", restore);
  }

  window.addEventListener("afterprint", restore);
  window.print();
  // Safari n'émet pas toujours « afterprint » ; sans ce filet l'application
  // resterait invisible à l'écran.
  setTimeout(restore, 2000);
}

/**
 * Le même devis dans un onglet du navigateur, en page autonome. Sur iPhone,
 * l'application installée sur l'écran d'accueil n'ouvre pas toujours la boîte
 * d'impression ; de Safari, le bouton Partager donne « Imprimer », « Envoyer
 * par mail » et l'enregistrement en PDF. C'est la porte de sortie.
 */
export function openNodeInBrowser(node, title) {
  const sheet = devisSheet(node);
  if (!sheet) return false;

  // Seule la feuille part dans l'onglet, sans son cadre : celui-ci porte la
  // hauteur réduite de l'aperçu et rogne ce qui dépasse. L'échelle du
  // téléphone est défaite avec lui — la page autonome s'affiche en A4, à sa
  // taille réelle.
  const clone = sheet.cloneNode(true);
  clone.style.transform = "none";
  clone.style.width = "";

  // La largeur d'une A4 en pixels, mesurée sur la feuille plutôt que calculée :
  // c'est au navigateur de convertir les millimètres. L'onglet la prend pour
  // largeur de page, et le téléphone y ajuste son écran tout seul — la feuille
  // garde ses proportions au lieu d'être rétrécie pour tenir dans 390 pixels.
  const sheetWidth = sheet.offsetWidth;

  const html = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=${sheetWidth}" />
    <base href="${window.location.origin}/" />
    <title>${escapeHtml(title)}</title>
    <style>
      body { margin: 0; background: #f4f3ef; display: flex; justify-content: center; }
      /* Sans cela la feuille, simple élément flexible, se laisse comprimer
         sous les 210 mm au lieu de déborder : le devis se recompose et n'est
         plus une A4. */
      .devis-page { flex: none; }
      @media print { body { background: #fff; display: block; } }
      ${devisCss}
    </style>
  </head>
  <body>${clone.outerHTML}</body>
</html>`;

  const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
  // Un lien plutôt que window.open() : c'est ce que l'application installée
  // sur l'écran d'accueil sait ouvrir dans Safari sans être bloquée.
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Laissé le temps que l'onglet charge la page avant de rendre l'adresse.
  setTimeout(() => URL.revokeObjectURL(url), 60000);
  return true;
}

function escapeHtml(text) {
  return String(text ?? "").replace(
    /[&<>"]/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]
  );
}
