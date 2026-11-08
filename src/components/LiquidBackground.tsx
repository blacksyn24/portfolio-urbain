export function LiquidBackground() {
  return (
    <>
      <div className="liquid-bg" aria-hidden>
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="blob b3" />
        <div className="grain" />
      </div>
      {/* Filtre de réfraction pour l'effet « verre liquide » (Chromium) */}
      <svg width="0" height="0" className="absolute" aria-hidden>
        <filter id="liquid-refraction" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.012" numOctaves="2" seed="7" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="2" result="soft" />
          <feDisplacementMap in="SourceGraphic" in2="soft" scale="38" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
    </>
  );
}
