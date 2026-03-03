"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { player } from "@/data/playerData";

type Period = "last-match" | "last-5" | "season";

const periodData: Record<Period, { score: number; context: string }> = {
  "last-match": {
    score: 81,
    context: "vs Al Wasl Academy · Feb 24 2026",
  },
  "last-5": {
    score: 76,
    context: "Average · Last 5 Matches",
  },
  season: {
    score: 74,
    context: "Season Average · 2026",
  },
};

function ScoreArc({ score }: { score: number }) {
  // r=36, circumference = 2*PI*36 = 226.2
  // dashoffset for score%: 226.2 - (score/100 * 226.2) = 226.2 * (1 - score/100)
  const C = 226.2;
  const dashOffset = C * (1 - score / 100);

  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      {/* Track */}
      <circle
        cx="50"
        cy="50"
        r="36"
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {/* Animated arc */}
      <circle
        className="score-arc-animate"
        cx="50"
        cy="50"
        r="36"
        fill="none"
        stroke="#4A4AFF"
        strokeWidth="5"
        strokeLinecap="round"
        style={{
          transform: "rotate(-90deg)",
          transformOrigin: "50px 50px",
          strokeDasharray: C,
          strokeDashoffset: dashOffset,
        }}
      />
    </svg>
  );
}

export default function HomeTab() {
  const [activePeriod, setActivePeriod] = useState<Period>("last-match");
  const [displayScore, setDisplayScore] = useState(81);
  const [scoreKey, setScoreKey] = useState(0);

  function handlePeriodChange(p: Period) {
    setActivePeriod(p);
    setDisplayScore(periodData[p].score);
    setScoreKey((k) => k + 1);
  }

  const currentData = periodData[activePeriod];

  // Kill dev server's initial scroll
  const solidRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (solidRef.current) solidRef.current.scrollTop = 0;
  }, []);

  return (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "#0D1020",
      }}
    >
      {/* ── IMAGE SECTION (52%) ── */}
      <div
        style={{
          height: "52dvh",
          position: "relative",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        {/* Ken Burns photo */}
        <Image
          src="/kiyan.jpg"
          alt="Kiyan Makkawi"
          fill
          priority
          className="ken-burns"
          style={{ objectFit: "cover", objectPosition: "center top" }}
        />

        {/* Gradient overlay — transparent top 60%, dark at bottom */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, transparent 60%, rgba(13,16,32,0.7) 80%, #0D1020 100%)",
          }}
        />

        {/* Jersey watermark */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          <span
            style={{
              fontSize: 160,
              fontWeight: 900,
              color: "rgba(255,255,255,0.07)",
              lineHeight: 1,
              letterSpacing: "-6px",
            }}
          >
            {player.jerseyNumber}
          </span>
        </div>

        {/* Top bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "48px 18px 12px",
          }}
        >
          {/* MAK Academy logo */}
          <div
            style={{
              background: "rgba(0,0,0,0.3)",
              backdropFilter: "blur(8px)",
              borderRadius: 10,
              padding: "6px 10px",
            }}
          >
            <Image
              src="/mak-logo.jpeg"
              alt="MAK Academy"
              width={80}
              height={32}
              style={{ height: 32, width: "auto", objectFit: "contain" }}
            />
          </div>

          {/* U12 Red pill */}
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#fff",
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.35)",
              borderRadius: 100,
              padding: "5px 14px",
              backdropFilter: "blur(8px)",
            }}
          >
            {player.team}
          </span>
        </div>

        {/* FairplAI logo — bottom center of image, at boundary */}
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Image
            src="/logo-white.png"
            alt="fairpl.ai"
            width={80}
            height={24}
            style={{ height: 24, width: "auto", objectFit: "contain", opacity: 0.85 }}
          />
        </div>
      </div>

      {/* ── SOLID SECTION (48%) ── */}
      <div
        ref={solidRef}
        style={{
          flex: 1,
          background: "#0D1020",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "16px 20px calc(80px + env(safe-area-inset-bottom, 0px) + 8px)",
        }}
        className="no-scrollbar"
      >
        {/* Player name */}
        <div className="fade-up-0" style={{ textAlign: "center", marginBottom: 4 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.6px", margin: 0 }}>
            {player.name}
          </h1>
        </div>

        {/* Position · Academy */}
        <p
          className="fade-up-0"
          style={{
            fontSize: 13,
            color: "#9DA2B3",
            textAlign: "center",
            marginBottom: 14,
          }}
        >
          {player.position} · {player.academy}
        </p>

        {/* Coach message card */}
        <div
          className="fade-up-1"
          style={{
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 14,
            padding: "14px 18px",
            width: "100%",
            marginBottom: 18,
          }}
        >
          <p
            style={{
              fontSize: 14,
              color: "#fff",
              fontStyle: "italic",
              textAlign: "center",
              lineHeight: 1.55,
              margin: 0,
            }}
          >
            &ldquo;Kiyan had a standout match today 🔥 — his energy and vision drove everything forward.&rdquo;
          </p>
        </div>

        {/* Score display */}
        <div
          className="fade-up-2"
          style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 12 }}
        >
          <div style={{ position: "relative", width: 100, height: 100 }}>
            <ScoreArc score={currentData.score} />
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                key={scoreKey}
                className="num-fade"
                style={{
                  fontSize: 32,
                  fontWeight: 900,
                  color: "#fff",
                  lineHeight: 1,
                  letterSpacing: "-1px",
                }}
              >
                {displayScore}
              </span>
            </div>
          </div>
          <p
            style={{
              fontSize: 10,
              color: "#9DA2B3",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              fontWeight: 600,
              marginTop: 4,
            }}
          >
            Match Score
          </p>
        </div>

        {/* Toggle pills */}
        <div
          className="fade-up-3"
          style={{ display: "flex", gap: 8, marginBottom: 10 }}
        >
          {(["last-match", "last-5", "season"] as Period[]).map((p) => {
            const labels: Record<Period, string> = {
              "last-match": "Last Match",
              "last-5": "Last 5",
              season: "Season",
            };
            const isActive = activePeriod === p;
            return (
              <button
                key={p}
                onClick={() => handlePeriodChange(p)}
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "6px 16px",
                  borderRadius: 20,
                  border: `1px solid ${isActive ? "#4A4AFF" : "#6E7180"}`,
                  background: isActive ? "#4A4AFF" : "transparent",
                  color: isActive ? "#fff" : "#6E7180",
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                }}
              >
                {labels[p]}
              </button>
            );
          })}
        </div>

        {/* Match context */}
        <p
          key={activePeriod}
          className="num-fade fade-up-4"
          style={{
            fontSize: 12,
            color: "#6E7180",
            textAlign: "center",
          }}
        >
          {currentData.context}
        </p>
      </div>
    </div>
  );
}

