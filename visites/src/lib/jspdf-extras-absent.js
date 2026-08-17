/**
 * jsPDF sait aussi avaler du HTML et du SVG tout seul, par trois bibliothèques
 * qu'il va chercher à la demande : html2canvas, canvg et DOMPurify. Le devis
 * ne passe pas par là — la feuille est photographiée par html2canvas-pro, puis
 * posée sur la page par `addImage`.
 *
 * Ces trois-là sont donc remplacées par ce fichier au moment du build (voir
 * `resolve.alias` dans vite.config.js). Sans lui, 380 Ko de code jamais
 * exécuté descendaient sur chaque téléphone à chaque déploiement : le service
 * worker met en cache tout ce que le build produit, sans savoir que personne
 * n'ira le chercher.
 *
 * Si l'un de ces chemins venait à servir, l'erreur ci-dessous le dira au lieu
 * de laisser passer un PDF vide.
 */
export default function absent() {
  throw new Error(
    "jsPDF a demandé html2canvas, canvg ou DOMPurify : le devis ne se sert que de addImage()."
  );
}
