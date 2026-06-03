import { useMemo } from 'react';
import { Link } from 'react-router-dom';

function generateStars(count = 180) {
  const stars = [];
  for (let i = 0; i < count; i++) {
    const size = Math.random() * 2 + 1;
    stars.push({
      id: i,
      style: {
        position: 'absolute',
        width: `${size}px`,
        height: `${size}px`,
        background: '#fff',
        borderRadius: '50%',
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        opacity: 0,
        animation: `twinkle ${3 + Math.random() * 5}s ${Math.random() * 5}s ease-in-out infinite alternate`,
      },
    });
  }
  return stars;
}

/* ──────────────────────────────────────────────
   Animated Keyboard — pure CSS, no image
   ────────────────────────────────────────────── */
const ROWS = [
  // Each row: array of [label, keyWidth, isAccent]
  [['Esc', 1.5], ['1', 1], ['2', 1], ['3', 1], ['4', 1], ['5', 1], ['6', 1], ['7', 1], ['8', 1], ['9', 1], ['0', 1], ['-', 1], ['+', 1], ['⌫', 1.8]],
  [['Tab', 1.6], ['Q', 1], ['W', 1], ['E', 1], ['R', 1], ['T', 1], ['Y', 1], ['U', 1], ['I', 1], ['O', 1], ['P', 1], ['[', 1], [']', 1], ['\\', 1.4]],
  [['Caps', 1.8], ['A', 1], ['S', 1], ['D', 1], ['F', 1], ['G', 1], ['H', 1], ['J', 1], ['K', 1], ['L', 1], [';', 1], ['\'', 1], ['Enter', 1.7]],
  [['Shift', 2.2], ['Z', 1], ['X', 1], ['C', 1], ['V', 1], ['B', 1], ['N', 1], ['M', 1], [',', 1], ['.', 1], ['/', 1], ['Shift', 1.6]],
  [['Fn', 1], ['Ctrl', 1], ['Alt', 1], ['', 6], ['Alt', 1], ['Ctrl', 1], ['←', 1], ['↑', 1], ['↓', 1], ['→', 1]],
];

/* Keys that will "press" with animation — picked by index [row, col] */
const ANIMATED_KEYS = [
  [0, 6],  // '6'
  [0, 10], // '0'
  [1, 3],  // 'E'
  [1, 7],  // 'U'
  [2, 2],  // 'S'
  [2, 6],  // 'H'
  [2, 8],  // 'K'
  [3, 1],  // 'Z'
  [3, 4],  // 'V'
  [3, 9],  // '.'
  [4, 3],  // '␣' (spacebar)
];

function AnimatedKeyboard() {
  const keyStaggers = useMemo(() => {
    const map = {};
    ANIMATED_KEYS.forEach(([r, c]) => {
      map[`${r}-${c}`] = (Math.random() * 4).toFixed(1);
    });
    return map;
  }, []);

  const accentKey = '0-12';

  return (
    <div
      className="relative"
      style={{
        transform: 'perspective(1400px) rotateZ(14deg) rotateX(18deg) rotateY(-6deg) scale(1.02)',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
    >
      {/* Sharp layered shadow — no blur */}
      <div
        className="absolute inset-0 rounded-lg"
        style={{
          boxShadow:
            '0 2px 0 0 #0a0a0a, 0 4px 0 0 #0a0a0a, 0 6px 0 0 #0a0a0a, 0 8px 0 0 #0a0a0a, 0 12px 0 0 #0a0a0a, 0 16px 0 0 #0a0a0a, 0 24px 0 0 #0a0a0a, 0 36px 20px rgba(0,0,0,0.5), 0 60px 40px rgba(0,0,0,0.4)',
          transform: 'translateZ(-1px)',
        }}
      />

      {/* Ambient red glow — subtle, no blur */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-16 bg-clavier-red/[0.08] rounded-full" />

      {/* Keyboard body */}
      <div
        className="relative bg-gradient-to-br from-[#2A2A2E] via-[#1E1E22] to-[#161618] rounded-lg p-3 pb-5 border border-[#3A3A3E]/50"
        style={{
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.3)',
        }}
      >
        {/* Top highlight */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-t-lg" />

        <div className="flex flex-col gap-1.5">
          {ROWS.map((row, ri) => (
            <div key={ri} className="flex gap-1 justify-center">
              {row.map(([label, width], ci) => {
                const keyId = `${ri}-${ci}`;
                const isAccent = keyId === accentKey;
                const isAnimated = !!keyStaggers[keyId];
                const stagger = keyStaggers[keyId] || 0;

                return (
                  <div
                    key={keyId}
                    className="relative flex items-center justify-center font-mono text-xs lg:text-sm select-none cursor-default"
                    style={{
                      width: `${width * 36}px`,
                      minWidth: `${width * 36}px`,
                      height: '36px',
                      borderRadius: '4px',
                      background: isAccent
                        ? 'linear-gradient(180deg, #D44A3A 0%, #B03020 100%)'
                        : 'linear-gradient(180deg, #3A3A3E 0%, #2A2A2E 100%)',
                      boxShadow: isAccent
                        ? '0 0 6px rgba(192,57,43,0.35), inset 0 1px 0 rgba(255,255,255,0.2), 0 2px 0 #0a0a0a'
                        : 'inset 0 1px 0 rgba(255,255,255,0.08), 0 2px 0 #0a0a0a',
                      color: isAccent ? '#F5F0EB' : '#8A8A8E',
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      transition: 'transform 0.06s ease, box-shadow 0.1s ease',
                      ...(isAnimated
                        ? {
                            animation: `keyPress 2.5s ${stagger}s ease-in-out infinite`,
                          }
                        : {}),
                    }}
                  >
                    {label}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-b-lg" />
      </div>
    </div>
  );
}

export default function Hero() {
  const stars = useMemo(() => generateStars(180), []);

  return (
    <section className="relative min-h-screen bg-clavier-bg overflow-hidden">
      {/* ── Starfield ─ */}
      <div className="absolute inset-0" aria-hidden="true">
        {stars.map(star => (
          <div key={star.id} style={star.style} />
        ))}
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="w-full max-w-[1280px] mx-auto px-8 lg:px-16 flex flex-col lg:flex-row items-center gap-8 lg:gap-0">

          {/* Left Column */}
          <div className="w-full lg:w-[45%] flex flex-col justify-center gap-8">
            {/* Brand */}
            <h1 className="font-cormorant italic text-[56px] lg:text-[80px] leading-none text-clavier-cream">
              Clavier
            </h1>

            {/* Tagline */}
            <div className="font-playfair text-xl lg:text-2xl leading-relaxed text-clavier-cream">
              <p>We sell Mechanical Keyboards</p>
              <p>
                Designed for{' '}
                <span className="font-playfair italic text-clavier-orange underline decoration-clavier-orange/60">
                  Elegance
                </span>
              </p>
            </div>

            {/* CTA */}
            <Link
              to="/products"
              className="flex items-center gap-2 group self-start mt-4"
            >
              <span className="text-clavier-orange font-semibold text-lg group-hover:brightness-125 transition-all duration-200">[</span>
              <span className="font-inter text-sm text-clavier-cream tracking-wide group-hover:text-clavier-orange transition-colors duration-200">
                View Products
              </span>
              <span className="text-clavier-orange font-semibold text-lg group-hover:brightness-125 transition-all duration-200">]</span>
            </Link>
          </div>

          {/* Right Column — Animated Keyboard */}
          <div className="w-full lg:w-[55%] flex items-center justify-center lg:justify-end">
            <AnimatedKeyboard />
          </div>
        </div>
      </div>

      {/* ── Key press animation keyframes ── */}
      <style>{`
        @keyframes keyPress {
          0%, 65%, 100% {
            transform: translateY(0);
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 2px 0 #0a0a0a;
          }
          5%, 15% {
            transform: translateY(2px);
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 #0a0a0a, 0 0 8px rgba(192,57,43,0.2);
          }
          20%, 60% {
            transform: translateY(0);
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 2px 0 #0a0a0a;
          }
        }
      `}</style>
    </section>
  );
}
