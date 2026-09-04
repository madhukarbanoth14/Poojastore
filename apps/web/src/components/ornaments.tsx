export function LotusMark({
  className = "h-5 w-5",
  gold = true,
}: {
  className?: string;
  gold?: boolean;
}) {
  const fill = gold ? "#C9A227" : "#E9CE6E";
  return (
    <svg viewBox="0 0 32 24" className={className} aria-hidden fill={fill}>
      <path d="M16 22c-2.2-3.6-6.8-6.2-11.4-6.6 3.2-1.4 6.6.2 8.4 2.2C11.8 12 10 6.6 10 3.2c2.8 1.8 5.2 5.4 6 8.6.8-3.2 3.2-6.8 6-8.6 0 3.4-1.8 8.8-3 14.4 1.8-2 5.2-3.6 8.4-2.2C22.8 15.8 18.2 18.4 16 22Z" />
      <ellipse cx="16" cy="14.5" rx="2.2" ry="3.4" fill={gold ? "#E9CE6E" : "#C9A227"} />
    </svg>
  );
}

export function LotusDivider({
  light = false,
  className = "",
}: {
  light?: boolean;
  className?: string;
}) {
  const stroke = light ? "rgba(233,206,110,0.85)" : "rgba(201,162,39,0.7)";
  return (
    <div className={`flex max-w-sm items-center gap-3 ${className}`} aria-hidden>
      <span
        className="h-px flex-1"
        style={{ background: `linear-gradient(90deg, transparent, ${stroke})` }}
      />
      <LotusMark className="h-4 w-5 shrink-0" gold={!light} />
      <span
        className="h-px flex-1"
        style={{ background: `linear-gradient(90deg, ${stroke}, transparent)` }}
      />
    </div>
  );
}

export function CornerFlourish({
  className = "",
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 80 80"
      className={className}
      aria-hidden
      fill="none"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <path
        d="M8 72C8 40 18 18 48 8"
        stroke="#E9CE6E"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M18 72C18 48 28 26 52 16"
        stroke="#C9A227"
        strokeWidth="0.7"
        strokeLinecap="round"
        opacity="0.7"
      />
      <circle cx="48" cy="8" r="2.2" fill="#E9CE6E" />
      <circle cx="8" cy="72" r="2.2" fill="#E85D04" />
    </svg>
  );
}

export function MandalaWatermark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden fill="none">
      <g stroke="#C9A227" strokeWidth="0.7">
        <circle cx="100" cy="100" r="92" />
        <circle cx="100" cy="100" r="74" />
        <circle cx="100" cy="100" r="42" />
        {Array.from({ length: 12 }).map((_, i) => (
          <ellipse
            key={i}
            cx="100"
            cy="52"
            rx="10"
            ry="28"
            transform={`rotate(${i * 30} 100 100)`}
          />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <path
            key={`p-${i}`}
            d="M100 18c6 18 6 28 0 46c-6-18-6-28 0-46Z"
            transform={`rotate(${i * 45} 100 100)`}
          />
        ))}
      </g>
      <circle cx="100" cy="100" r="8" fill="#C9A227" opacity="0.35" />
    </svg>
  );
}

export function ToranBar() {
  return (
    <div className="toran" aria-hidden>
      {Array.from({ length: 21 }).map((_, i) => (
        <span key={i} className={i % 2 === 0 ? "toran-gold" : "toran-orange"} />
      ))}
    </div>
  );
}

export function YantraRings({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden fill="none">
      <g stroke="#E9CE6E" strokeOpacity="0.55">
        <circle cx="100" cy="100" r="96" strokeWidth="0.6" />
        <circle cx="100" cy="100" r="82" strokeWidth="0.4" />
        <circle cx="100" cy="100" r="68" strokeWidth="0.7" />
        {Array.from({ length: 16 }).map((_, i) => (
          <line
            key={i}
            x1="100"
            y1="10"
            x2="100"
            y2="22"
            strokeWidth="0.8"
            transform={`rotate(${i * 22.5} 100 100)`}
          />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <ellipse
            key={`e-${i}`}
            cx="100"
            cy="58"
            rx="14"
            ry="26"
            strokeWidth="0.45"
            transform={`rotate(${i * 45} 100 100)`}
          />
        ))}
      </g>
    </svg>
  );
}

