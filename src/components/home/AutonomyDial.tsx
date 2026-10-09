"use client";

import { useState } from "react";
import { dialLevels, hire } from "@/content/home";

export function AutonomyDial() {
  const [level, setLevel] = useState(hire.dialDefault);
  const current = dialLevels[level];

  return (
    <div className="dial">
      <div className="dial-scale" role="radiogroup" aria-label="Autonomy level">
        {dialLevels.map((l) => (
          <button
            key={l.level}
            type="button"
            role="radio"
            aria-checked={l.level === level}
            className={l.level <= level ? "lit" : ""}
            onClick={() => setLevel(l.level)}
          >
            <span>{l.level}</span>
          </button>
        ))}
        <i className="dial-line" style={{ "--lv": level / (dialLevels.length - 1) } as React.CSSProperties} />
      </div>
      <div className="dial-read" aria-live="polite">
        <p className="dial-name">
          Level {current.level} · {current.name}
        </p>
        <p>{current.description}</p>
      </div>
    </div>
  );
}
