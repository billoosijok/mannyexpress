export default function PhotoGallery({ urls = [] }) {
  if (urls.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {urls.map((url) => (
        <a key={url} href={url} target="_blank" rel="noreferrer">
          <img
            src={url}
            alt=""
            className="h-16 w-16 rounded-lg border border-line object-cover"
          />
        </a>
      ))}
    </div>
  );
}
