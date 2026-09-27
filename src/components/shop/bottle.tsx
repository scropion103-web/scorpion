/** Perfume bottle illustration used when a product has no photo (ported from the original design) */
export function Bottle({ color, shape, className }: { color: string; shape: number; className?: string }) {
  const bodies = [
    <rect key="0" x="22" y="46" width="76" height="98" rx="22" fill={color} />,
    <rect key="1" x="34" y="46" width="52" height="98" rx="12" fill={color} />,
    <circle key="2" cx="60" cy="100" r="46" fill={color} />,
    <path
      key="3"
      d="M28 68l32-20 32 20v56l-32 20-32-20z"
      fill={color}
      stroke={color}
      strokeWidth="6"
      strokeLinejoin="round"
    />,
  ];
  return (
    <svg viewBox="0 0 120 152" aria-hidden="true" className={className}>
      <rect x="46" y="6" width="28" height="24" rx="5" fill="#B8893F" />
      <rect x="52" y="30" width="16" height="18" fill="#1B1A17" />
      {bodies[shape] ?? bodies[0]}
      <path d="M60 84c-7 9-11 15-11 21a11 11 0 0 0 22 0c0-6-4-12-11-21z" fill="#F5F0E8" />
      <ellipse cx={shape === 1 ? 42 : 36} cy="72" rx="4" ry="16" fill="#fff" opacity=".13" />
    </svg>
  );
}

export function HeroBottle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 420 480" aria-hidden="true">
      <circle cx="210" cy="250" r="195" fill="none" stroke="#B8893F" strokeOpacity=".28" />
      <circle
        cx="210"
        cy="250"
        r="152"
        fill="none"
        stroke="#B8893F"
        strokeOpacity=".45"
        strokeDasharray="2 9"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <circle cx="210" cy="250" r="112" fill="#B8893F" fillOpacity=".09" />
      <g className="animate-float">
        <rect x="180" y="58" width="60" height="44" rx="9" fill="#B8893F" />
        <rect x="193" y="102" width="34" height="36" fill="#F5F0E8" fillOpacity=".92" />
        <rect x="118" y="138" width="184" height="232" rx="48" fill="#F5F0E8" />
        <path d="M210 210c-16 21-26 34-26 48a26 26 0 0 0 52 0c0-14-10-27-26-48z" fill="#1B1A17" />
        <rect x="136" y="162" width="9" height="150" rx="4.5" fill="#fff" opacity=".55" />
      </g>
      <circle cx="330" cy="120" r="5" fill="#B8893F" />
      <circle cx="82" cy="330" r="4" fill="#B8893F" fillOpacity=".7" />
      <circle cx="352" cy="360" r="3" fill="#F5F0E8" fillOpacity=".6" />
    </svg>
  );
}

export function DropMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 30" className={className} aria-hidden="true">
      <path d="M12 2C8 8 5 12 5 17a7 7 0 0 0 14 0c0-5-3-9-7-15z" fill="#B8893F" />
      <path d="M12 15c-2 2.6-3 4-3 5.2a3 3 0 0 0 6 0c0-1.2-1-2.6-3-5.2z" fill="#1B1A17" />
    </svg>
  );
}
