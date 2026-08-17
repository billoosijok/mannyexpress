import { devisSheet } from "./print";

/**
 * Le devis en PDF A4, fabriqué par l'application elle-même.
 *
 * Pourquoi ne pas s'en remettre à la boîte d'impression du téléphone : sur
 * iPhone elle ne s'ouvre pas depuis l'application installée sur l'écran
 * d'accueil, et le « PDF » du bouton Partager de Safari, lui, sort une page
 * unique à la hauteur de la page web — jamais une A4. Ici le format n'est
 * demandé à personne : la page fait 210 × 297 mm, écrits dans le fichier.
 */

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

/*
 * La feuille est photographiée à deux fois sa taille : le texte reste net une
 * fois imprimé sans que le fichier double de poids. Le chiffre est fixe, et
 * non celui de l'écran : le même devis doit peser et rendre pareil, qu'il
 * sorte d'un iPhone ou d'un ordinateur.
 */
const RENDER_SCALE = 2;

/** Le nom du fichier proposé au moment de l'enregistrer. */
function pdfFileName(fileName) {
  return `${fileName || "Devis"}.pdf`;
}

/** Attend que le logo soit chargé : html2canvas ne l'attend pas lui-même. */
function imagesReady(root) {
  const images = Array.from(root.querySelectorAll("img"));
  return Promise.all(
    images.map((image) =>
      image.complete
        ? Promise.resolve()
        : new Promise((resolve) => {
            image.addEventListener("load", resolve, { once: true });
            image.addEventListener("error", resolve, { once: true });
          })
    )
  );
}

/**
 * La feuille en image, à sa taille réelle. À l'écran elle porte l'échelle du
 * téléphone et son cadre la rogne : les deux sont défaits sur la copie que
 * html2canvas se fait de la page, jamais sur celle que le gérant regarde.
 */
async function captureSheet(sheet) {
  const { default: html2canvas } = await import("html2canvas-pro");

  await imagesReady(sheet);

  return html2canvas(sheet, {
    scale: RENDER_SCALE,
    backgroundColor: "#ffffff",
    logging: false,
    useCORS: true,
    // Mesurées sans la mise à l'échelle : c'est la taille de l'A4.
    width: sheet.offsetWidth,
    height: sheet.offsetHeight,
    onclone: (_document, clone) => {
      clone.style.transform = "none";
      clone.style.boxShadow = "none";
      const frame = clone.parentElement;
      if (frame) {
        frame.style.height = "auto";
        frame.style.overflow = "visible";
      }
    },
  });
}

/** Une tranche de la feuille, de la hauteur d'une page, sur fond blanc. */
function sliceDataUrl(canvas, top, height) {
  if (top === 0 && height === canvas.height) return canvas.toDataURL("image/png");

  const slice = document.createElement("canvas");
  slice.width = canvas.width;
  slice.height = height;
  const context = slice.getContext("2d");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, slice.width, slice.height);
  context.drawImage(canvas, 0, top, canvas.width, height, 0, 0, canvas.width, height);
  return slice.toDataURL("image/png");
}

/**
 * Le PDF du devis : une A4 par page, au millimètre. Le devis tient sur une
 * page ; des listes rallongées peuvent le faire passer à deux, et il est
 * alors coupé à la hauteur exacte d'une A4 plutôt qu'étiré sur une page
 * unique interminable.
 */
export async function devisPdfBlob(node) {
  const sheet = devisSheet(node);
  if (!sheet) return null;

  const canvas = await captureSheet(sheet);
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait",
    compress: true,
  });

  // L'image fait la largeur d'une A4 : ce rapport dit combien de pixels vaut
  // un millimètre, et donc où couper.
  const pixelsPerMm = canvas.width / A4_WIDTH_MM;
  const pageHeightPx = A4_HEIGHT_MM * pixelsPerMm;
  // La marge de 0,01 évite qu'un dépassement d'un demi-millimètre — un arrondi
  // de rendu — ajoute une seconde page vide derrière le devis.
  const pages = Math.max(1, Math.ceil(canvas.height / pageHeightPx - 0.01));

  for (let page = 0; page < pages; page += 1) {
    const top = Math.round(page * pageHeightPx);
    const height = Math.min(Math.round(pageHeightPx), canvas.height - top);
    if (page > 0) pdf.addPage("a4", "portrait");
    pdf.addImage(
      sliceDataUrl(canvas, top, height),
      "PNG",
      0,
      0,
      A4_WIDTH_MM,
      height / pixelsPerMm,
      undefined,
      "FAST"
    );
  }

  return pdf.output("blob");
}

/** Le fichier descend dans les téléchargements. C'est la voie de l'ordinateur. */
function downloadPdf(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = pdfFileName(fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

/**
 * Enregistre le PDF déjà fabriqué. Sur iPhone c'est la feuille de partage du
 * système qui s'ouvre — « Enregistrer dans Fichiers », Mail, WhatsApp — parce
 * qu'un téléchargement n'a nulle part où aller depuis l'application installée
 * sur l'écran d'accueil.
 *
 * Volontairement pas `async` : `navigator.share()` doit partir dans le geste
 * même du doigt. Une seule attente avant lui et Safari refuse la feuille de
 * partage — d'où le PDF gardé de côté, et le second appui qui l'ouvre.
 */
export function sharePdf(blob, fileName) {
  const name = pdfFileName(fileName);
  let file = null;
  try {
    file = new File([blob], name, { type: "application/pdf" });
  } catch {
    file = null;
  }

  if (!file || !navigator.canShare?.({ files: [file] })) {
    downloadPdf(blob, fileName);
    return Promise.resolve("downloaded");
  }

  return navigator.share({ files: [file] }).then(
    () => "shared",
    // « Annuler » sur la feuille de partage n'est pas une panne ; un refus,
    // lui, laisse le PDF prêt pour l'appui suivant.
    (error) => (error?.name === "AbortError" ? "cancelled" : "blocked")
  );
}
