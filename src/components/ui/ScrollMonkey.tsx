"use client";

import { useEffect, useRef, useState } from "react";

const W = 160;
const H = 220;
const HALF = W / 2;

export function ScrollMonkey() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [openPct, setOpenPct] = useState(0); // 0 = closed, 1 = fully open

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (!started && scrollY > 50) setStarted(true);

      // Open: 80px → 380px scroll
      // Stay open until last 200px of page
      // Close: last 200px
      const openStart = 80;
      const openEnd = 380;
      const closeStart = docHeight - 200;

      let pct = 0;
      if (scrollY <= openStart) {
        pct = 0;
      } else if (scrollY <= openEnd) {
        pct = (scrollY - openStart) / (openEnd - openStart);
      } else if (scrollY <= closeStart) {
        pct = 1;
      } else {
        pct = 1 - Math.min((scrollY - closeStart) / 200, 1);
      }

      setOpenPct(pct);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [started]);

  useEffect(() => {
    if (started && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [started]);

  // Doors slide out but always keep a 22px strip visible
  const MAX_SLIDE = HALF - 22;
  const slide = MAX_SLIDE * openPct;

  return (
    <div className="fixed bottom-4 right-4 z-50" style={{ width: W, height: H }}>

      {/* Monkey */}
      <video
        ref={videoRef}
        src="/monkey_dance.mp4"
        loop
        muted
        playsInline
        preload="auto"
        className="h-full w-full object-contain"
        style={{
          mixBlendMode: "multiply",
          maskImage: "radial-gradient(ellipse 65% 52% at 50% 62%, black 35%, rgba(0,0,0,0.5) 60%, transparent 82%)",
          WebkitMaskImage: "radial-gradient(ellipse 65% 52% at 50% 62%, black 35%, rgba(0,0,0,0.5) 60%, transparent 82%)",
        }}
      />

      {/* Door overlay: clips doors at container edges */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">

        {/* Left door */}
        <div
          className="absolute top-0 left-0 h-full"
          style={{
            width: HALF,
            transform: `translateX(${-slide}px)`,
            transition: "transform 0.05s linear",
          }}
        >
          <svg width={HALF} height={H} viewBox={`0 0 ${HALF} ${H}`} fill="none">
            {/* Door body */}
            <rect x="0" y="0" width={HALF} height={H} fill="#EDE8DF" />
            {/* Frame inset top */}
            <rect x="5" y="6" width={HALF - 11} height={H * 0.42} rx="2"
              fill="#E4DDD2" stroke="#C8BA9E" strokeWidth="1" />
            {/* Frame inset bottom */}
            <rect x="5" y={H * 0.42 + 12} width={HALF - 11} height={H * 0.46}
              rx="2" fill="#E4DDD2" stroke="#C8BA9E" strokeWidth="1" />
            {/* Right edge frame */}
            <rect x={HALF - 3} y="0" width="3" height={H} fill="#C8BA9E" />
            {/* Top frame */}
            <rect x="0" y="0" width={HALF} height="4" fill="#C8BA9E" />
            {/* Bottom frame */}
            <rect x="0" y={H - 4} width={HALF} height="4" fill="#C8BA9E" />
            {/* Left edge frame */}
            <rect x="0" y="0" width="3" height={H} fill="#C8BA9E" />
            {/* Door knob */}
            <circle cx={HALF - 9} cy={H / 2} r="5" fill="#8B6914" />
            <circle cx={HALF - 9} cy={H / 2} r="3" fill="#C8A840" />
          </svg>
        </div>

        {/* Right door */}
        <div
          className="absolute top-0 right-0 h-full"
          style={{
            width: HALF,
            transform: `translateX(${slide}px)`,
            transition: "transform 0.05s linear",
          }}
        >
          <svg width={HALF} height={H} viewBox={`0 0 ${HALF} ${H}`} fill="none">
            {/* Door body */}
            <rect x="0" y="0" width={HALF} height={H} fill="#EDE8DF" />
            {/* Frame inset top */}
            <rect x="6" y="6" width={HALF - 11} height={H * 0.42} rx="2"
              fill="#E4DDD2" stroke="#C8BA9E" strokeWidth="1" />
            {/* Frame inset bottom */}
            <rect x="6" y={H * 0.42 + 12} width={HALF - 11} height={H * 0.46}
              rx="2" fill="#E4DDD2" stroke="#C8BA9E" strokeWidth="1" />
            {/* Left edge frame */}
            <rect x="0" y="0" width="3" height={H} fill="#C8BA9E" />
            {/* Top frame */}
            <rect x="0" y="0" width={HALF} height="4" fill="#C8BA9E" />
            {/* Bottom frame */}
            <rect x="0" y={H - 4} width={HALF} height="4" fill="#C8BA9E" />
            {/* Right edge frame */}
            <rect x={HALF - 3} y="0" width="3" height={H} fill="#C8BA9E" />
            {/* Door knob */}
            <circle cx="9" cy={H / 2} r="5" fill="#8B6914" />
            <circle cx="9" cy={H / 2} r="3" fill="#C8A840" />
          </svg>
        </div>

      </div>
    </div>
  );
}
