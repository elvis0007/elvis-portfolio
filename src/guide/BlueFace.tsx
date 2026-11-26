/** Cara de BLUE en SVG (respaldo mientras carga el 3D y sprite del minijuego). */
export function BlueFace({ className = "size-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <polygon points="22,42 18,12 42,28" fill="#F8F8F8" />
      <polygon points="78,42 82,12 58,28" fill="#F8F8F8" />
      <polygon points="25,37 22,19 37,29" fill="#F4B6CC" />
      <polygon points="75,37 78,19 63,29" fill="#F4B6CC" />
      <ellipse cx="50" cy="54" rx="30" ry="26" fill="#F8F8F8" />
      <ellipse cx="38" cy="50" rx="5.5" ry="6.5" fill="#00E5FF" />
      <ellipse cx="62" cy="50" rx="5.5" ry="6.5" fill="#00E5FF" />
      <circle cx="38" cy="50" r="2.4" fill="#080808" />
      <circle cx="62" cy="50" r="2.4" fill="#080808" />
      <circle cx="39.5" cy="48" r="1.1" fill="#F8F8F8" />
      <circle cx="63.5" cy="48" r="1.1" fill="#F8F8F8" />
      <polygon points="47,58 53,58 50,62" fill="#F4B6CC" />
      <path d="M44 65 Q50 69 56 65" stroke="#080808" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M26 75 Q50 84 74 75" stroke="#FF2E63" strokeWidth="6" fill="none" strokeLinecap="round" />
      <circle cx="50" cy="82" r="4.5" fill="#00E5FF" stroke="#080808" strokeWidth="1.2" />
    </svg>
  );
}
