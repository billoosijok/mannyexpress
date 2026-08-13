const MAX_SIDE = 1000;
const QUALITY = 0.6;

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image-decode-failed"));
    };
    image.src = url;
  });
}

/**
 * Scales an image so its longest side is at most 1000px and re-encodes it as
 * JPEG. A 4 MB phone photo comes out around 100-200 KB, which is what makes
 * uploading from a customer's home on a weak connection workable.
 */
export async function compressImage(file) {
  const image = await loadImage(file);
  const longest = Math.max(image.width, image.height);
  const scale = longest > MAX_SIDE ? MAX_SIDE / longest : 1;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);

  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", QUALITY)
  );
  if (!blob) throw new Error("image-encode-failed");
  return blob;
}
