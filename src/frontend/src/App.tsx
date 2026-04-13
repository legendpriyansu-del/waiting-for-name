import { useCallback, useEffect, useRef, useState } from "react";

const TOTAL = 6;
const DOT_LABELS = [
  "Opening",
  "Beginning",
  "Love",
  "Memories",
  "Promise",
  "Question",
];
const EMOJIS = ["❤️", "💕", "💗", "💖", "🩷", "🤍", "🩵", "💜", "💘", "💝", "♥️"];
const NO_MSGS = [
  "Hint: just click Yes and save yourself some money 😊",
  "Really? Try again. 💀",
  "That button has commitment issues, not me 😂",
  "I literally coded it to run away 💨",
  "You're only increasing your fine 😅",
  "This button fears commitment more than anything",
  "Fun fact: it cannot be clicked. Ever.",
  "The fine is going up... just saying 💸",
  "Still trying? I admire the persistence 😏",
  "My code > your stubbornness 💪",
  "The No button has left the chat 🚪",
  "Even the button knows the answer 💕",
  "Each attempt = more kisses owed 😘",
  "I'll wait... I have all day ⏰",
  "The button filed a restraining order 📜",
  "You: tries No | Me: laughs in developer 👨‍💻",
  "This fine buys us a nice dinner 😂",
  "Button relocated to a safer place 🏃",
  "At this rate, fine pays for the honeymoon 😂",
  "Your persistence is cute but futile 🥰",
];

// ─── FEATURE 2: Target date for countdown ───
const TARGET_DATE = new Date("2027-02-14T00:00:00");

interface HeartParticle {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  wobble: number;
  wobbleSpeed: number;
  rot: number;
  rotSpeed: number;
  opacity: number;
  maxOpacity: number;
  emoji: string;
  fadeIn: boolean;
}

interface CountdownValues {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  passed: boolean;
}

function getCountdown(): CountdownValues {
  const diff = TARGET_DATE.getTime() - Date.now();
  if (diff <= 0)
    return { days: 0, hours: 0, minutes: 0, seconds: 0, passed: true };
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds, passed: false };
}

function createHeart(W: number, H: number, randomY = false): HeartParticle {
  const h: HeartParticle = {
    x: Math.random() * W,
    y: randomY ? Math.random() * H : H + 30,
    size: Math.random() * 18 + 10,
    speed: Math.random() * 1.2 + 0.4,
    drift: (Math.random() - 0.5) * 0.8,
    wobble: Math.random() * Math.PI * 2,
    wobbleSpeed: Math.random() * 0.02 + 0.005,
    rot: Math.random() * 0.6 - 0.3,
    rotSpeed: (Math.random() - 0.5) * 0.008,
    opacity: 0,
    maxOpacity: Math.random() * 0.4 + 0.15,
    emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    fadeIn: true,
  };
  if (randomY) {
    h.opacity = h.maxOpacity;
    h.fadeIn = false;
  }
  return h;
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const btnAreaRef = useRef<HTMLDivElement>(null);
  const noBtnRef = useRef<HTMLButtonElement>(null);
  const yesBtnRef = useRef<HTMLButtonElement>(null);
  const finaleRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const envelopeRef = useRef<HTMLButtonElement>(null);
  const progressWrapRef = useRef<HTMLDivElement>(null);
  const dotsContainerRef = useRef<HTMLDivElement>(null);
  const typewriterRef = useRef<HTMLHeadingElement>(null);
  const fineBoxRef = useRef<HTMLDivElement>(null);
  // ─── FEATURE 1: music ref ───
  const audioRef = useRef<HTMLAudioElement>(null);

  const [cur, setCur] = useState(-1); // -1 = intro not done yet
  const [fine, setFine] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [distEscaped, setDistEscaped] = useState(0);
  const [showFineSection, setShowFineSection] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showFinale, setShowFinale] = useState(false);
  const [twText, setTwText] = useState("");
  // ─── FEATURE 1: music state ───
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMusicTooltip, setShowMusicTooltip] = useState(false);
  // ─── FEATURE 2: countdown state ───
  const [countdown, setCountdown] = useState<CountdownValues>(getCountdown());
  // ─── FEATURE 3: share toast ───
  const [showShareToast, setShowShareToast] = useState(false);

  const twDoneRef = useRef(false);
  const isTypingRef = useRef(false);
  const heartsRef = useRef<HeartParticle[]>([]);
  const animFrameRef = useRef<number>(0);
  const cursorAnimRef = useRef<number>(0);
  const rxRef = useRef(0);
  const ryRef = useRef(0);
  const mxRef = useRef(0);
  const myRef = useRef(0);
  const fineRef = useRef(0);
  const attemptsRef = useRef(0);
  const distRef = useRef(0);
  const noLeft = useRef("calc(50% + 90px)");
  const noTop = useRef("calc(50% + 25px)");
  const [noBtnPos, setNoBtnPos] = useState({
    left: "calc(50% + 90px)",
    top: "calc(50% + 25px)",
  });
  const [noBtnScale, setNoBtnScale] = useState(1);
  const [noBtnOpacity, setNoBtnOpacity] = useState(1);
  const [yesShake, setYesShake] = useState(false);
  const [fineFlash, setFineFlash] = useState(false);
  const [fineMsg, setFineMsg] = useState(
    "Hint: just click Yes and save yourself some money 😊",
  );
  const [statAttempts, setStatAttempts] = useState(0);
  const [statDist, setStatDist] = useState("0px");
  const [statPat, setStatPat] = useState("100%");
  const [statPatColor, setStatPatColor] = useState("var(--green)");
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);
  const toastCountRef = useRef(0);
  const curSlideRef = useRef(-1);

  // sync fine ref
  useEffect(() => {
    fineRef.current = fine;
  }, [fine]);
  useEffect(() => {
    attemptsRef.current = attempts;
  }, [attempts]);
  useEffect(() => {
    distRef.current = distEscaped;
  }, [distEscaped]);

  // ─── FEATURE 3: Check ?finale=true on mount ───
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("finale") === "true") {
      setShowFinale(true);
      // Hide intro immediately
      const intro = introRef.current;
      if (intro) {
        intro.style.opacity = "0";
        intro.style.visibility = "hidden";
      }
    }
  }, []);

  // ─── FEATURE 2: Countdown timer ───
  useEffect(() => {
    if (!showFinale) return;
    setCountdown(getCountdown());
    const interval = setInterval(() => {
      setCountdown(getCountdown());
    }, 1000);
    return () => clearInterval(interval);
  }, [showFinale]);

  // ═══ HEART CANVAS ═══
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let W = 0;
    let H = 0;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Init hearts
    heartsRef.current = [];
    for (let i = 0; i < 25; i++) {
      heartsRef.current.push(createHeart(W, H, true));
    }

    const animate = () => {
      ctx.clearRect(0, 0, W, H);
      for (const h of heartsRef.current) {
        h.y -= h.speed;
        h.wobble += h.wobbleSpeed;
        h.x += Math.sin(h.wobble) * h.drift;
        h.rot += h.rotSpeed;
        if (h.fadeIn) {
          h.opacity += 0.008;
          if (h.opacity >= h.maxOpacity) h.fadeIn = false;
        }
        if (h.y < H * 0.15) h.opacity -= 0.003;
        if (h.opacity <= 0 || h.y < -40) {
          const nh = createHeart(W, H);
          Object.assign(h, nh);
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0, h.opacity);
        ctx.translate(h.x, h.y);
        ctx.rotate(h.rot);
        ctx.font = `${h.size}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(h.emoji, 0, 0);
        ctx.restore();
      }
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // ═══ CUSTOM CURSOR ═══
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mxRef.current = e.clientX;
      myRef.current = e.clientY;
      const dot = cursorDotRef.current;
      if (dot) {
        dot.style.left = `${e.clientX - 3}px`;
        dot.style.top = `${e.clientY - 3}px`;
      }
    };
    document.addEventListener("mousemove", onMove);

    const loop = () => {
      rxRef.current += (mxRef.current - rxRef.current) * 0.12;
      ryRef.current += (myRef.current - ryRef.current) * 0.12;
      const ring = cursorRingRef.current;
      if (ring) {
        ring.style.left = `${rxRef.current}px`;
        ring.style.top = `${ryRef.current}px`;
      }
      cursorAnimRef.current = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(cursorAnimRef.current);
    };
  }, []);

  // ═══ BUTTON CURSOR HOVER ═══
  useEffect(() => {
    const buttons = document.querySelectorAll("button");
    const enter = () => {
      const r = cursorRingRef.current;
      if (r) {
        r.style.width = "50px";
        r.style.height = "50px";
        r.style.borderColor = "rgba(236,72,153,0.4)";
      }
    };
    const leave = () => {
      const r = cursorRingRef.current;
      if (r) {
        r.style.width = "36px";
        r.style.height = "36px";
        r.style.borderColor = "rgba(236,72,153,0.25)";
      }
    };
    for (const b of buttons) {
      b.addEventListener("mouseenter", enter);
      b.addEventListener("mouseleave", leave);
    }
    return () => {
      for (const b of buttons) {
        b.removeEventListener("mouseenter", enter);
        b.removeEventListener("mouseleave", leave);
      }
    };
  });

  // ═══ KEYBOARD NAV ═══
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (showFinale) return;
      const c = curSlideRef.current;
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        if (c < TOTAL - 1 && c >= 0) go(c + 1);
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        if (c > 0) go(c - 1);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showFinale]);

  // ═══ TRAIT MOUSE GLOW ═══
  useEffect(() => {
    const traits = document.querySelectorAll<HTMLElement>(".trait");
    const handlers: Array<{ el: HTMLElement; fn: (e: MouseEvent) => void }> =
      [];
    for (const t of traits) {
      const fn = (e: MouseEvent) => {
        const r = t.getBoundingClientRect();
        t.style.setProperty(
          "--mx",
          `${((e.clientX - r.left) / r.width) * 100}%`,
        );
        t.style.setProperty(
          "--my",
          `${((e.clientY - r.top) / r.height) * 100}%`,
        );
      };
      t.addEventListener("mousemove", fn);
      handlers.push({ el: t, fn });
    }
    return () => {
      for (const { el, fn } of handlers)
        el.removeEventListener("mousemove", fn);
    };
  });

  // ═══ CONTEXT MENU ON NO BUTTON ═══
  useEffect(() => {
    const onCtx = (e: MouseEvent) => {
      if ((e.target as HTMLElement).id === "noBtn") {
        e.preventDefault();
        showToast("No cheating! +$50");
        runAway();
      }
    };
    document.addEventListener("contextmenu", onCtx);
    return () => document.removeEventListener("contextmenu", onCtx);
  });

  // ═══ TYPEWRITER ═══
  const startTypewriter = useCallback(() => {
    if (isTypingRef.current) return;
    isTypingRef.current = true;
    setTwText("");
    twDoneRef.current = false;
    const text = "Hi, my love...";
    let i = 0;
    const type = () => {
      if (i < text.length) {
        setTwText(text.slice(0, i + 1));
        i++;
        setTimeout(type, 120);
      } else {
        twDoneRef.current = true;
        isTypingRef.current = false;
      }
    };
    setTimeout(type, 800);
  }, []);

  // ═══ SLIDE NAV ═══
  const go = useCallback(
    (index: number) => {
      if (index < 0 || index >= TOTAL) return;
      // Reset typewriter flag when leaving slide 0
      if (curSlideRef.current === 0 && index !== 0) {
        isTypingRef.current = false;
      }
      curSlideRef.current = index;
      setCur(index);

      // Update progress
      const pf = document.getElementById("progressFill");
      if (pf) pf.style.width = `${(index / (TOTAL - 1)) * 100}%`;

      // Trigger typewriter on slide 0
      if (index === 0) {
        setTimeout(() => startTypewriter(), 350);
      }
    },
    [startTypewriter],
  );

  // ═══ OPEN ENVELOPE ═══
  const openEnvelope = useCallback(() => {
    const env = envelopeRef.current;
    if (!env) return;
    env.classList.add("opened");
    setTimeout(() => {
      const intro = introRef.current;
      if (intro) intro.classList.add("hide");
      const pw = progressWrapRef.current;
      if (pw) pw.style.opacity = "1";
      const dc = dotsContainerRef.current;
      if (dc) dc.style.opacity = "1";
      go(0);
    }, 1200);
  }, [go]);

  // ═══ SHOW TOAST ═══
  const showToast = useCallback((msg: string) => {
    const id = ++toastCountRef.current;
    setToasts((prev) => [...prev, { id, msg }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      1600,
    );
  }, []);

  // ─── FEATURE 1: Toggle music ───
  const toggleMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Autoplay blocked — user gesture required, try again
          setIsPlaying(false);
        });
    }
  }, [isPlaying]);

  // ─── FEATURE 3: Copy shareable link ───
  const shareFinale = useCallback(() => {
    const url = `${window.location.origin}${window.location.pathname}?finale=true`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 3500);
      })
      .catch(() => {
        // Fallback for browsers without clipboard API
        showToast("Copy this link: ?finale=true 💕");
      });
  }, [showToast]);

  // ═══ RUNAWAY NO ═══
  const runAway = useCallback(() => {
    const newAttempts = attemptsRef.current + 1;
    const newFine = fineRef.current + 50;
    const newDist = distRef.current;

    attemptsRef.current = newAttempts;
    fineRef.current = newFine;

    setAttempts(newAttempts);
    setFine(newFine);
    setShowFineSection(true);
    setShowStats(true);

    const pat = Math.max(0, 100 - newAttempts * 5);
    setStatAttempts(newAttempts);
    setStatPat(`${pat}%`);
    setStatPatColor(
      pat <= 30 ? "#f87171" : pat <= 60 ? "#fbbf24" : "var(--green)",
    );

    // Fine flash
    setFineFlash(true);
    setTimeout(() => setFineFlash(false), 400);

    setFineMsg(NO_MSGS[Math.min(newAttempts - 1, NO_MSGS.length - 1)]);
    showToast("Nice try! +$50 fine 💸");

    // Move no button
    const area = btnAreaRef.current;
    const btn = noBtnRef.current;
    if (area && btn) {
      const bw = btn.offsetWidth;
      const bh = btn.offsetHeight;
      const areaW = area.offsetWidth;
      const areaH = area.offsetHeight;
      const mx = Math.max(0, areaW - bw - 16);
      const my = Math.max(0, areaH - bh - 8);
      const nx = Math.random() * mx;
      const ny = Math.random() * my;
      const px = Number.parseFloat(btn.style.left) || 0;
      const py = Number.parseFloat(btn.style.top) || 0;
      const d = Math.round(Math.sqrt((nx - px) ** 2 + (ny - py) ** 2));
      distRef.current = newDist + d;
      setDistEscaped(distRef.current);
      setStatDist(`${distRef.current.toLocaleString()}px`);
      noLeft.current = `${nx}px`;
      noTop.current = `${ny}px`;
      setNoBtnPos({ left: `${nx}px`, top: `${ny}px` });
    }

    if (newAttempts > 5) {
      const s = Math.max(0.25, 1 - (newAttempts - 5) * 0.06);
      const op = Math.max(0.15, 1 - (newAttempts - 5) * 0.07);
      setNoBtnScale(s);
      setNoBtnOpacity(op);
    }

    if (newAttempts > 3) {
      setYesShake(true);
      setTimeout(() => setYesShake(false), 400);
    }
  }, [showToast]);

  // ═══ SAY YES ═══
  const sayYes = useCallback(() => {
    setShowFinale(true);
    const pf = document.getElementById("progressFill");
    if (pf) pf.style.width = "100%";

    // Confetti
    const colors = [
      "#3B82F6",
      "#8B5CF6",
      "#EC4899",
      "#F59E0B",
      "#10B981",
      "#EF4444",
      "#fff",
      "#60A5FA",
      "#C084FC",
      "#F472B6",
      "#34D399",
      "#FBBF24",
    ];
    for (let i = 0; i < 250; i++) {
      setTimeout(() => {
        const c = document.createElement("div");
        c.className = "confetti";
        c.style.left = `${Math.random() * 100}vw`;
        c.style.width = `${Math.random() * 10 + 4}px`;
        c.style.height = `${Math.random() * 10 + 4}px`;
        c.style.background = colors[Math.floor(Math.random() * colors.length)];
        c.style.borderRadius = Math.random() > 0.5 ? "50%" : "3px";
        c.style.animation = `confettiFall ${Math.random() * 3 + 2}s linear forwards`;
        document.body.appendChild(c);
        setTimeout(() => c.remove(), 5500);
      }, i * 15);
    }

    // Heart burst
    let hc = 0;
    const hi = setInterval(() => {
      const h = document.createElement("div");
      h.style.cssText = `position:fixed;pointer-events:none;z-index:102;left:${Math.random() * 100}vw;top:${Math.random() * 60 + 15}vh;font-size:${Math.random() * 28 + 14}px;opacity:0;animation:flowUp ${Math.random() * 2 + 2}s ease-out forwards`;
      h.style.setProperty("--drift", `${Math.random() * 80 - 40}px`);
      h.style.setProperty("--spin", `${Math.random() * 360}deg`);
      h.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      document.body.appendChild(h);
      setTimeout(() => h.remove(), 5000);
      hc++;
      if (hc > 50) clearInterval(hi);
    }, 120);

    // Extra canvas hearts burst
    const W = window.innerWidth;
    const H = window.innerHeight;
    for (let i = 0; i < 15; i++) {
      const bh = createHeart(W, H);
      bh.speed *= 2;
      bh.maxOpacity *= 2;
      heartsRef.current.push(bh);
    }
    setTimeout(() => {
      for (let i = 0; i < 15; i++) heartsRef.current.pop();
    }, 15000);
  }, []);

  // ─── STAR FIELD for intro ───
  const stars = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    delay: Math.random() * 3,
    duration: Math.random() * 2 + 1.5,
  }));

  const slideActive = (i: number) => cur === i;

  const CheckIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--green)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );

  const ArrowIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );

  const HeartFillIcon = () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="rgba(239,68,68,0.4)"
      stroke="none"
      aria-hidden="true"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );

  // ─── FEATURE 2: Countdown pill component ───
  const CountdownPill = ({
    value,
    label,
  }: { value: number; label: string }) => (
    <div className="countdown-pill">
      <span className="countdown-num">{String(value).padStart(2, "0")}</span>
      <span className="countdown-label">{label}</span>
    </div>
  );

  return (
    <>
      {/* ─── CURSOR ─── */}
      <div className="cursor-dot" ref={cursorDotRef} />
      <div className="cursor-ring" ref={cursorRingRef} />

      {/* ─── HEART CANVAS ─── */}
      <canvas id="heartCanvas" ref={canvasRef} />

      {/* ─── FEATURE 1: Hidden Audio element ─── */}
      {/* biome-ignore lint/a11y/useMediaCaption: background music, no captions needed */}
      <audio
        ref={audioRef}
        src="https://archive.org/download/ArcticMonkeysiWannaBeYours/Arctic%20Monkeys%20-%20I%20Wanna%20Be%20Yours.mp3"
        loop
        preload="auto"
      />

      {/* ─── FEATURE 1: Music Toggle Button ─── */}
      <div className="music-btn-wrap" data-ocid="music-toggle">
        <button
          type="button"
          className={`music-btn${isPlaying ? " playing" : ""}`}
          onClick={toggleMusic}
          onMouseEnter={() => setShowMusicTooltip(true)}
          onMouseLeave={() => setShowMusicTooltip(false)}
          aria-label="Toggle music"
        >
          {isPlaying ? "🎵" : "🔇"}
        </button>
        {showMusicTooltip && (
          <div className="music-tooltip">
            {isPlaying ? "Pause music" : "Click to play music"}
          </div>
        )}
      </div>

      {/* ─── INTRO ─── */}
      <div id="intro" ref={introRef}>
        <div className="star-field">
          {stars.map((s) => (
            <div
              key={s.id}
              className="star"
              style={{
                left: `${s.left}%`,
                top: `${s.top}%`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                animationDelay: `${s.delay}s`,
                animationDuration: `${s.duration}s`,
              }}
            />
          ))}
        </div>
        <button
          type="button"
          className="envelope"
          id="envelope"
          ref={envelopeRef}
          onClick={openEnvelope}
        >
          <div className="envelope-flap" />
          <div className="envelope-body" />
          <div className="letter serif" style={{ fontStyle: "italic" }}>
            For you...
          </div>
        </button>
        <p className="tap-hint">tap the envelope to open</p>
      </div>

      {/* ─── PROGRESS ─── */}
      <div
        className="progress-wrap"
        id="progressWrap"
        ref={progressWrapRef}
        style={{ opacity: 0, transition: "opacity 0.5s ease" }}
      >
        <div
          className="progress-fill"
          id="progressFill"
          style={{ width: "0%" }}
        />
      </div>

      {/* ─── DOTS ─── */}
      <div
        className="dots"
        id="dots"
        ref={dotsContainerRef}
        style={{ opacity: 0, transition: "opacity 0.5s ease" }}
      >
        {DOT_LABELS.map((label, i) => (
          <div
            key={label}
            className={`dot${cur === i ? " active" : ""}`}
            data-label={label}
            onClick={() => go(i)}
            onKeyDown={(e) => e.key === "Enter" && go(i)}
            role="button"
            tabIndex={0}
          />
        ))}
      </div>

      {/* ═══ TOASTS ═══ */}
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          {t.msg}
        </div>
      ))}

      {/* ─── FEATURE 3: Share toast ─── */}
      {showShareToast && (
        <div className="toast toast-share" data-ocid="share-toast">
          Link copied! Share the love 💕
        </div>
      )}

      {/* ═══════ SLIDE 0 — Opening ═══════ */}
      <div className={`slide${slideActive(0) ? " active" : ""}`} id="s0">
        <div className="bg-image">
          <img
            src="https://picsum.photos/seed/dreamy-sunset-love-soft/1920/1080.jpg"
            alt=""
          />
          <div className="overlay" />
        </div>
        <div
          className="bg-glow"
          style={{
            width: "500px",
            height: "500px",
            background: "rgba(59,130,246,0.06)",
            top: "-100px",
            right: "-100px",
          }}
        />
        <div className="slide-inner text-center px-6 max-w-3xl mx-auto">
          <div
            className="mb-8"
            style={{ animation: "heartBeat 1.5s ease-in-out infinite" }}
          >
            <span
              style={{
                fontSize: "72px",
                display: "inline-block",
                filter: "drop-shadow(0 0 20px rgba(236,72,153,0.4))",
              }}
            >
              💕
            </span>
          </div>
          <p
            className="text-xs uppercase mb-6"
            style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "0.3em" }}
          >
            A Present for My Babyyy😙
          </p>
          <h1
            ref={typewriterRef}
            className="serif text-4xl md:text-7xl font-normal tracking-tight mb-6 leading-none"
            style={{
              background:
                "linear-gradient(135deg,#fff 0%,rgba(96,165,250,0.9) 50%,rgba(192,132,252,0.9) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              minHeight: "1.2em",
              display: "block",
            }}
          >
            {twText}
            {cur === 0 && <span className="tw-cursor" />}
          </h1>
          <p
            className="text-base md:text-lg leading-relaxed mb-4 max-w-xl mx-auto"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            Before you go any further, I need you to know —
          </p>
          <p
            className="serif text-xl md:text-2xl italic leading-relaxed mb-12 max-w-lg mx-auto"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            every single word that follows was written with a full heart.
          </p>
          <button type="button" className="btn-next" onClick={() => go(1)}>
            Take my hand <ArrowIcon />
          </button>
        </div>
      </div>

      {/* ═══════ SLIDE 1 — When I First Saw You ═══════ */}
      <div className={`slide${slideActive(1) ? " active" : ""}`} id="s1">
        <div
          className="aurora-orb"
          style={{
            width: "450px",
            height: "450px",
            background: "rgba(59,130,246,0.12)",
            top: "5%",
            left: "-120px",
            animationDelay: "0s",
          }}
        />
        <div
          className="aurora-orb"
          style={{
            width: "380px",
            height: "380px",
            background: "rgba(139,92,246,0.1)",
            bottom: "5%",
            right: "-100px",
            animationDelay: "-6s",
          }}
        />
        <div
          className="aurora-orb"
          style={{
            width: "300px",
            height: "300px",
            background: "rgba(236,72,153,0.07)",
            top: "40%",
            right: "15%",
            animationDelay: "-12s",
          }}
        />
        <div className="slide-inner px-6 max-w-5xl mx-auto w-full">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
            <div className="flex-shrink-0">
              <div
                className="polaroid w-60 h-72 md:w-72 md:h-96"
                style={
                  {
                    animation:
                      "photoIn 0.7s cubic-bezier(0.16,1,0.3,1) 0.2s forwards",
                    opacity: 0,
                    "--rot": "-2deg",
                  } as React.CSSProperties
                }
              >
                <img
                  src="C:\Users\legen\Downloads\06355843b8d83caa6da78c1064ab75b6.jpg"
                  alt="The day everything changed"
                />
                <div className="cap">
                  <span>the day everything changed</span>
                </div>
              </div>
            </div>
            <div className="text-center md:text-left max-w-md">
              <p
                className="text-xs uppercase mb-4"
                style={{ color: "var(--blue)", letterSpacing: "0.25em" }}
              >
                Chapter One
              </p>
              <h2
                className="serif text-3xl md:text-5xl tracking-tight mb-6 leading-tight"
                style={{
                  background:
                    "linear-gradient(to right,#fff,rgba(96,165,250,0.85))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                When I First Saw You
              </h2>
              <p
                className="text-base leading-relaxed mb-4"
                style={{ color: "rgba(255,255,255,0.4)", lineHeight: 1.8 }}
              >
                I remember that exact moment. My heart did something it had
                never done before — it{" "}
                <span style={{ color: "rgba(255,255,255,0.7)" }}>
                  skipped a beat
                </span>
                . Like the universe hit pause just so I could notice you.
              </p>
              <p
                className="text-base leading-relaxed mb-4"
                style={{ color: "rgba(255,255,255,0.4)", lineHeight: 1.8 }}
              >
                Your smile, your laugh, the way you carried yourself — like the
                whole world was a stage and you didn't even know it.
              </p>
              <p
                className="serif italic text-lg leading-relaxed mb-10"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                I didn't know it then, but that was the moment my life truly
                began.
              </p>
              <div className="flex justify-center md:justify-start">
                <button
                  type="button"
                  className="btn-next"
                  onClick={() => go(2)}
                >
                  Our journey continues <ArrowIcon />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ SLIDE 2 — Things I Love About You ═══════ */}
      <div className={`slide${slideActive(2) ? " active" : ""}`} id="s2">
        <div
          className="aurora-orb"
          style={{
            width: "500px",
            height: "500px",
            background: "rgba(139,92,246,0.1)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            animationDelay: "-4s",
          }}
        />
        <div
          className="aurora-orb"
          style={{
            width: "300px",
            height: "300px",
            background: "rgba(236,72,153,0.08)",
            top: "10%",
            right: "5%",
            animationDelay: "-10s",
          }}
        />
        <div className="slide-inner px-6 max-w-4xl mx-auto text-center w-full">
          <p
            className="text-xs uppercase mb-4"
            style={{ color: "var(--purple)", letterSpacing: "0.25em" }}
          >
            Chapter Two
          </p>
          <h2
            className="serif text-3xl md:text-5xl tracking-tight mb-12 leading-tight"
            style={{
              background:
                "linear-gradient(to right,#fff,rgba(168,85,247,0.85))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Things I Love About You
          </h2>
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-12 text-left"
            id="traitGrid"
          >
            <div className="trait">
              <div
                className="icon-wrap"
                style={{
                  background: "rgba(236,72,153,0.08)",
                  border: "1px solid rgba(236,72,153,0.12)",
                }}
              >
                😍
              </div>
              <h3>Your Smile</h3>
              <p>
                My favorite thing in the entire universe. It could cure sadness
                in a heartbeat.
              </p>
            </div>
            <div className="trait">
              <div
                className="icon-wrap"
                style={{
                  background: "rgba(59,130,246,0.08)",
                  border: "1px solid rgba(59,130,246,0.12)",
                }}
              >
                🧠
              </div>
              <h3>Your Mind</h3>
              <p>
                The way you think, the way you see the world — it inspires me
                every single day.
              </p>
            </div>
            <div className="trait">
              <div
                className="icon-wrap"
                style={{
                  background: "rgba(52,211,153,0.08)",
                  border: "1px solid rgba(52,211,153,0.12)",
                }}
              >
                🤗
              </div>
              <h3>Your Kindness</h3>
              <p>
                You care so deeply about everyone around you. Your heart is pure
                gold.
              </p>
            </div>
            <div className="trait">
              <div
                className="icon-wrap"
                style={{
                  background: "rgba(245,158,11,0.08)",
                  border: "1px solid rgba(245,158,11,0.12)",
                }}
              >
                😂
              </div>
              <h3>Your Laugh</h3>
              <p>
                That real, unfiltered laugh — I'd move mountains just to hear it
                one more time.
              </p>
            </div>
            <div className="trait">
              <div
                className="icon-wrap"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.12)",
                }}
              >
                😜
              </div>
              <h3>Your Smell</h3>
              <p>yayyyyyyy</p>
            </div>
            <div className="trait">
              <div
                className="icon-wrap"
                style={{
                  background: "rgba(236,72,153,0.08)",
                  border: "1px solid rgba(236,72,153,0.12)",
                }}
              >
                ✨
              </div>
              <h3>Just... You</h3>
              <p>
                Everything. Every little thing. Even what you think are flaws —
                I love those most.
              </p>
            </div>
          </div>
          <button type="button" className="btn-next" onClick={() => go(3)}>
            There's more... <ArrowIcon />
          </button>
        </div>
      </div>

      {/* ═══════ SLIDE 3 — Our Beautiful Memories ═══════ */}
      <div className={`slide${slideActive(3) ? " active" : ""}`} id="s3">
        <div
          className="aurora-orb"
          style={{
            width: "400px",
            height: "400px",
            background: "rgba(236,72,153,0.08)",
            top: "10%",
            left: "-80px",
            animationDelay: "-3s",
          }}
        />
        <div
          className="aurora-orb"
          style={{
            width: "350px",
            height: "350px",
            background: "rgba(59,130,246,0.07)",
            bottom: "10%",
            right: "-80px",
            animationDelay: "-9s",
          }}
        />
        <div className="slide-inner px-6 max-w-5xl mx-auto w-full">
          <div className="text-center mb-10">
            <p
              className="text-xs uppercase mb-4"
              style={{ color: "var(--pink)", letterSpacing: "0.25em" }}
            >
              Chapter Three
            </p>
            <h2
              className="serif text-3xl md:text-5xl tracking-tight mb-4 leading-tight"
              style={{
                background:
                  "linear-gradient(to right,#fff,rgba(236,72,153,0.85))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Our Beautiful Memories
            </h2>
            <p
              className="text-sm max-w-md mx-auto"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              Every moment with you is a memory I treasure more than anything.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-10">
            <div
              className="photo-card aspect-square"
              style={{ "--rot": "-2deg" } as React.CSSProperties}
            >
              <img
                src="C:\Users\legen\OneDrive\Pictures\Siddhababa\Cannon\DSC02863.JPG"
                alt="Memory"
              />
            </div>
            <div
              className="photo-card aspect-square md:row-span-2"
              style={{ "--rot": "1deg" } as React.CSSProperties}
            >
              <img
                src="C:\Users\legen\OneDrive\Pictures\Siddhababa\Cannon\DSC02865.JPG"
                alt="Memory"
              />
            </div>
            <div
              className="photo-card aspect-square"
              style={{ "--rot": "-1deg" } as React.CSSProperties}
            >
              <img
                src="C:\Users\legen\Downloads\61NDf9ggSYL._AC_UF1000,1000_QL80_.jpg"
                alt="Memory"
              />
            </div>
          </div>
          <div className="text-center">
            <button type="button" className="btn-next" onClick={() => go(4)}>
              Almost there... <ArrowIcon />
            </button>
          </div>
        </div>
      </div>

      {/* ═══════ SLIDE 4 — My Promise To You ═══════ */}
      <div className={`slide${slideActive(4) ? " active" : ""}`} id="s4">
        <div className="bg-image">
          <img
            src="https://picsum.photos/seed/deep-starry-sky-milky/1920/1080.jpg"
            alt=""
          />
          <div className="overlay" />
        </div>
        <div className="slide-inner px-6 max-w-3xl mx-auto text-center relative z-10">
          <p
            className="text-xs uppercase mb-4"
            style={{ color: "var(--green)", letterSpacing: "0.25em" }}
          >
            Chapter Four
          </p>
          <h2
            className="serif text-3xl md:text-5xl tracking-tight mb-10 leading-tight"
            style={{
              background:
                "linear-gradient(to right,#fff,rgba(52,211,153,0.85))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            My Promise To You
          </h2>
          <div className="space-y-3 text-left max-w-lg mx-auto mb-10">
            <div className="promise">
              <div className="p-icon">
                <CheckIcon />
              </div>
              <p>
                I promise to always make you laugh, even on your worst days.
              </p>
            </div>
            <div className="promise">
              <div className="p-icon">
                <CheckIcon />
              </div>
              <p>
                I promise to be your shelter in every storm life throws at us.
              </p>
            </div>
            <div className="promise">
              <div className="p-icon">
                <CheckIcon />
              </div>
              <p>
                I promise to choose you — every morning, every day, for the rest
                of my life.
              </p>
            </div>
            <div className="promise">
              <div className="p-icon">
                <CheckIcon />
              </div>
              <p>
                I promise to never stop surprising you, never stop growing with
                you, never take you for granted.
              </p>
            </div>
            <div className="promise">
              <div className="p-icon">
                <CheckIcon />
              </div>
              <p>
                I promise that our love story will be my greatest masterpiece.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn-next"
            onClick={() => go(5)}
            style={{
              background: "linear-gradient(135deg,var(--pink),var(--purple))",
            }}
          >
            The moment you've been waiting for{" "}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {/* ═══════ SLIDE 5 — Will You Marry Me? ═══════ */}
      <div className={`slide${slideActive(5) ? " active" : ""}`} id="s5">
        <div
          className="aurora-orb"
          style={{
            width: "600px",
            height: "600px",
            background: "rgba(59,130,246,0.08)",
            top: "-100px",
            left: "50%",
            transform: "translateX(-50%)",
            animationDelay: "-2s",
          }}
        />
        <div
          className="aurora-orb"
          style={{
            width: "400px",
            height: "400px",
            background: "rgba(236,72,153,0.06)",
            bottom: "-80px",
            left: "50%",
            transform: "translateX(-50%)",
            animationDelay: "-10s",
          }}
        />
        {[
          {
            top: "8%",
            left: "12%",
            color: "var(--blue)",
            delay: "0s",
            id: "s0",
          },
          {
            top: "18%",
            right: "15%",
            color: "var(--purple)",
            delay: "0.6s",
            id: "s1",
          },
          {
            bottom: "22%",
            left: "8%",
            color: "var(--pink)",
            delay: "1.2s",
            id: "s2",
          },
          {
            bottom: "12%",
            right: "12%",
            color: "var(--blue)",
            delay: "1.8s",
            id: "s3",
          },
          {
            top: "45%",
            left: "4%",
            color: "var(--purple)",
            delay: "0.9s",
            id: "s4",
          },
          {
            top: "35%",
            right: "6%",
            color: "var(--pink)",
            delay: "1.5s",
            id: "s5",
          },
          {
            top: "60%",
            left: "18%",
            color: "var(--gold)",
            delay: "2.1s",
            id: "s6",
          },
          {
            top: "15%",
            left: "45%",
            color: "var(--green)",
            delay: "0.3s",
            id: "s7",
          },
        ].map((s) => {
          const { id, ...style } = s;
          return (
            <div
              key={id}
              className="sparkle-dot"
              style={style as React.CSSProperties}
            />
          );
        })}
        <div className="slide-inner text-center px-6 max-w-2xl mx-auto">
          <div className="ring-pedestal mb-6">
            <span className="ring-big">💍</span>
          </div>
          <h2
            className="serif text-4xl md:text-6xl font-normal tracking-tight mb-4 leading-tight"
            style={{
              background:
                "linear-gradient(135deg,#fff 0%,rgba(96,165,250,0.9) 35%,rgba(168,85,247,0.9) 65%,rgba(236,72,153,0.9) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Will You Marry Me?
          </h2>
          <p
            className="text-sm md:text-base mb-10 max-w-sm mx-auto"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            There's only one right answer... and my code won't let you choose
            wrong. 😏
          </p>

          <div
            id="btnArea"
            ref={btnAreaRef}
            className="relative h-[170px] md:h-[140px] flex items-center justify-center mb-6"
          >
            <button
              type="button"
              className="btn-yes"
              id="yesBtn"
              ref={yesBtnRef}
              onClick={sayYes}
              style={{
                animation: yesShake
                  ? "shake 0.35s ease"
                  : "btnGrad 4s ease infinite,pulseGlow 3s ease-in-out infinite",
              }}
            >
              Yes, Forever! 💕
            </button>
            <button
              type="button"
              className="btn-no"
              id="noBtn"
              ref={noBtnRef}
              onMouseEnter={runAway}
              onClick={runAway}
              onTouchStart={runAway}
              style={{
                left: noBtnPos.left,
                top: noBtnPos.top,
                transform: `scale(${noBtnScale})`,
                opacity: noBtnOpacity,
              }}
            >
              No
            </button>
          </div>

          {showFineSection && (
            <div id="fineSec" className="mb-4">
              <div
                className={`fine-box${fineFlash ? " flash" : ""}`}
                ref={fineBoxRef}
              >
                <span
                  style={{
                    color: "rgba(239,68,68,0.6)",
                    fontSize: "13px",
                    fontWeight: 500,
                  }}
                >
                  ⚠️ Fine for attempting "No":
                </span>
                <span className="fine-amount">${fine.toLocaleString()}</span>
              </div>
              <p
                className="mt-3"
                style={{
                  color: "rgba(255,255,255,0.2)",
                  fontSize: "12px",
                  transition: "all 0.3s",
                }}
              >
                {fineMsg}
              </p>
            </div>
          )}

          {showStats && (
            <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
              <div
                className="p-3 rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.04)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <div
                  className="text-lg font-semibold"
                  style={{ color: "var(--blue)" }}
                >
                  {statAttempts}
                </div>
                <div
                  className="text-[9px] uppercase mt-1"
                  style={{
                    color: "rgba(255,255,255,0.2)",
                    letterSpacing: "0.12em",
                  }}
                >
                  Attempts
                </div>
              </div>
              <div
                className="p-3 rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.04)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <div
                  className="text-lg font-semibold"
                  style={{ color: "var(--purple)" }}
                >
                  {statDist}
                </div>
                <div
                  className="text-[9px] uppercase mt-1"
                  style={{
                    color: "rgba(255,255,255,0.2)",
                    letterSpacing: "0.12em",
                  }}
                >
                  Escaped
                </div>
              </div>
              <div
                className="p-3 rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.04)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <div
                  className="text-lg font-semibold"
                  style={{ color: statPatColor }}
                >
                  {statPat}
                </div>
                <div
                  className="text-[9px] uppercase mt-1"
                  style={{
                    color: "rgba(255,255,255,0.2)",
                    letterSpacing: "0.12em",
                  }}
                >
                  Patience
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════ FINALE ═══════ */}
      <div id="finale" ref={finaleRef} className={showFinale ? "show" : ""}>
        <div className="fin-inner text-center px-6 max-w-2xl mx-auto">
          <div className="ring-glow-wrap mb-6">
            <span className="ring-big">💍</span>
          </div>
          <h1
            className="serif font-normal tracking-tight mb-6 leading-tight"
            style={{
              fontSize: "clamp(3rem, 8vw, 6rem)",
              background:
                "linear-gradient(135deg,rgba(96,165,250,1),rgba(168,85,247,1),rgba(236,72,153,1),rgba(245,158,11,1))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            She Said Yes!
          </h1>
          <p
            className="serif text-2xl md:text-3xl italic mb-3"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            I knew you would 😊
          </p>
          <p
            className="text-base leading-relaxed mb-8 max-w-lg mx-auto"
            style={{ color: "rgba(255,255,255,0.35)", lineHeight: 1.8 }}
          >
            You just made me the happiest person alive. From this moment, every
            sunrise belongs to us, every dream is ours to chase, and every
            chapter — we write together.
          </p>

          <div className="flex items-center justify-center flex-wrap gap-1 mb-10">
            {[
              {
                icon: "💍",
                bg: "rgba(59,130,246,0.08)",
                border: "rgba(59,130,246,0.12)",
                label: "Engaged",
              },
              {
                icon: "💒",
                bg: "rgba(139,92,246,0.08)",
                border: "rgba(139,92,246,0.12)",
                label: "Wedding",
              },
              {
                icon: "🏠",
                bg: "rgba(236,72,153,0.08)",
                border: "rgba(236,72,153,0.12)",
                label: "Home",
              },
              {
                icon: "👨‍👩‍👧‍👦",
                bg: "rgba(245,158,11,0.08)",
                border: "rgba(245,158,11,0.12)",
                label: "Family",
              },
              {
                icon: "👴👵",
                bg: "rgba(52,211,153,0.08)",
                border: "rgba(52,211,153,0.12)",
                label: "Forever",
              },
            ].map((item, i, arr) => (
              <div key={item.label} className="flex items-center">
                <div className="timeline-item">
                  <div
                    className="timeline-icon"
                    style={{
                      background: item.bg,
                      border: `1px solid ${item.border}`,
                    }}
                  >
                    {item.icon}
                  </div>
                  <span
                    className="text-[9px] uppercase"
                    style={{
                      color: "rgba(255,255,255,0.25)",
                      letterSpacing: "0.12em",
                    }}
                  >
                    {item.label}
                  </span>
                </div>
                {i < arr.length - 1 && <div className="timeline-line mx-1" />}
              </div>
            ))}
          </div>

          {fine > 0 && (
            <div
              className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl mb-8"
              style={{
                background: "rgba(59,130,246,0.06)",
                border: "1px solid rgba(59,130,246,0.1)",
              }}
            >
              <span style={{ color: "rgba(96,165,250,0.6)", fontSize: "13px" }}>
                💰 Fine accumulated:
              </span>
              <span
                className="text-xl font-semibold"
                style={{ color: "rgba(147,197,253,0.8)" }}
              >
                ${fine.toLocaleString()}
              </span>
              <span style={{ color: "rgba(96,165,250,0.5)", fontSize: "12px" }}>
                (Payable in kisses 😘)
              </span>
            </div>
          )}

          <div className="quote-box max-w-md mx-auto mb-8">
            <p
              className="serif italic text-lg leading-relaxed"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              "In all the world, there is no heart for me like yours. In all the
              world, there is no love for you like mine."
            </p>
            <p
              className="text-xs mt-4"
              style={{ color: "rgba(255,255,255,0.2)" }}
            >
              — Maya Angelou
            </p>
          </div>

          {/* ─── FEATURE 2: Countdown Timer ─── */}
          <div className="countdown-wrap mb-8" data-ocid="countdown-timer">
            <p className="countdown-title">Counting every moment with you</p>
            {countdown.passed ? (
              <p className="countdown-passed">Every moment together ✨</p>
            ) : (
              <div className="countdown-grid">
                <CountdownPill value={countdown.days} label="days" />
                <CountdownPill value={countdown.hours} label="hrs" />
                <CountdownPill value={countdown.minutes} label="min" />
                <CountdownPill value={countdown.seconds} label="sec" />
              </div>
            )}
            <p className="countdown-subtitle">Until Valentine's Day 2027 💕</p>
          </div>

          {/* ─── FEATURE 3: Share Button ─── */}
          <div className="mb-10" data-ocid="share-section">
            <button
              type="button"
              className="btn-share"
              onClick={shareFinale}
              data-ocid="share-btn"
            >
              <span>✨</span>
              Share this moment 💕
            </button>
          </div>

          <div
            className="flex items-center justify-center gap-2 mb-12"
            style={{ color: "rgba(255,255,255,0.15)", fontSize: "13px" }}
          >
            <HeartFillIcon /> <span>Forever & always, yours</span>{" "}
            <HeartFillIcon />
          </div>
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.08)" }}>
            Made with 💙 and a lot of nervousness
          </p>
        </div>
      </div>
    </>
  );
}
