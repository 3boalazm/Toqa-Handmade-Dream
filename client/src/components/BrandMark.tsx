/**
 * The Toqa brand mark. Shared by the landing page and the hidden wishes page.
 */
export default function BrandMark({ small = false }: { small?: boolean }) {
  return (
    <span className={`brand-mark${small ? " brand-mark--small" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 40 40" fill="none">
        <path d="M20 3.5 34.5 20 20 36.5 5.5 20 20 3.5Z" />
        <path d="M20 3.5V36.5M5.5 20H34.5M20 3.5 27.1 20 20 36.5 12.9 20 20 3.5Z" />
        <circle cx="20" cy="20" r="2.2" />
      </svg>
    </span>
  );
}
