import devisCss from "../devis.css?raw";

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
  if (!node) return false;

  const clone = node.cloneNode(true);
  // L'aperçu est réduit pour tenir dans l'écran du téléphone ; la page
  // autonome, elle, s'affiche en taille réelle.
  clone.style.transform = "";
  clone.style.width = "";

  const html = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <base href="${window.location.origin}/" />
    <title>${escapeHtml(title)}</title>
    <style>
      body { margin: 0; background: #f4f3ef; display: flex; justify-content: center; }
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
