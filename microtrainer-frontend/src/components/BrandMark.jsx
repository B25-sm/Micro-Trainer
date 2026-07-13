export default function BrandMark({ className = "h-8 w-8", alt = "" }) {
  return (
    <img
      src="/microtrainer-icon.png"
      alt={alt}
      className={`shrink-0 object-contain ${className}`}
      draggable="false"
    />
  );
}
