"use client";

import { useEffect, useState } from "react";

const ROUTES = [
  "M -20 120 L 220 120 L 220 300 L 520 300",
  "M 520 80 L 330 80 L 330 220 L -20 220",
  "M 140 -20 L 140 420",
  "M 420 -20 L 420 420",
];

/** Decorative road network with a few slow vehicles, for the sign-in screens. */
export default function RoadBackdrop() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 500 400"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
    >
      {ROUTES.map((d, i) => (
        <g key={i}>
          <path d={d} fill="none" stroke="hsl(210 12% 14%)" strokeWidth="26" strokeLinejoin="round" />
          <path
            d={d}
            fill="none"
            stroke="hsl(42 20% 93% / 0.16)"
            strokeWidth="2"
            strokeDasharray="14 12"
            strokeLinejoin="round"
          />
          {!reduced &&
            [0, 1].map((k) => (
              <circle key={k} r="4" fill={["#3DD68C", "#F5B83D", "#3AA0F0", "#3DD68C"][i]} opacity="0.85">
                <animateMotion
                  dur={`${16 + i * 3}s`}
                  begin={`${-k * (8 + i)}s`}
                  repeatCount="indefinite"
                  path={d}
                />
              </circle>
            ))}
        </g>
      ))}
    </svg>
  );
}
