"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { categoryGrades, percentileData } from "@/data/playerData";

const LineChartClient = dynamic(() => import("./LineChartClient"), { ssr: false });

const NAV_H = 80;
const cardShadow = "0 2px 12px rgba(0,0,0,0.06)";

function SectionLabel({ text, sub }: { text: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 10, marginTop: 20 }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: "#4A4AFF", letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>
        {text}
      </p>
      {sub && <p style={{ fontSize: 13, color: "#9DA2B3", marginTop: 2, margin: 0 }}>{sub}</p>}
    </div>
  );
}

function CoachMessageCard() {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/coach-message", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ playerId: "kiyan-makkawi" }),
    })
      .then((r) => r.json())
      .then((d) => {
        setMessage(d.message);
        setLoading(false);
      })
      .catch(() => {
        setMessage(null);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div
        style={{
          background: "linear-gradient(135deg, #1B1650 0%, #282689 100%)",
          borderRadius: 16,
          padding: "20px",
          boxShadow: cardShadow,
        }}
      >
        <div className="skeleton" style={{ height: 16, width: "90%", marginBottom: 10 }} />
        <div className="skeleton" style={{ height: 16, width: "80%", marginBottom: 10 }} />
        <div className="skeleton" style={{ height: 16, width: "60%", marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 12, width: "40%", marginLeft: "auto" }} />
      </div>
    );
  }

  if (!message) {
    return (
      <div
        style={{
          background: "#F5F6FC",
          border: "1px solid #EDEFF7",
          borderRadius: 16,
          padding: "20px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 14, color: "#9DA2B3" }}>Coach message unavailable right now</p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #1B1650 0%, #282689 100%)",
        borderRadius: 16,
        padding: "20px",
        position: "relative",
        boxShadow: "0 8px 32px rgba(27,22,80,0.25)",
      }}
    >
      <p
        style={{
          fontSize: 15,
          color: "#F5F6FC",
          fontStyle: "italic",
          lineHeight: 1.65,
          margin: 0,
          paddingBottom: 28,
        }}
      >
        &ldquo;{message}&rdquo;
      </p>
      <div
        style={{
          position: "absolute",
          bottom: 14,
          right: 16,
          display: "flex",
          alignItems: "center",
          gap: 5,
        }}
      >
        <span style={{ fontSize: 13 }}>✨</span>
        <span style={{ fontSize: 11, color: "#9DA2B3", fontWeight: 600 }}>
          AI Coach · Powered by FairplAI
        </span>
      </div>
    </div>
  );
}

function GradeCard({ item }: { item: (typeof categoryGrades)[number] }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: "14px",
        boxShadow: cardShadow,
      }}
    >
      <p style={{ fontSize: 14, fontWeight: 700, color: "#1B1650", margin: "0 0 4px" }}>
        {item.category}
      </p>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontSize: 32, fontWeight: 900, color: item.gradeColor, lineHeight: 1 }}>
          {item.grade}
        </span>
        <span style={{ fontSize: 11, color: "#9DA2B3", fontWeight: 600 }}>
          {item.score}/100
        </span>
      </div>
      <p style={{ fontSize: 12, color: "#6E7180", margin: "2px 0 8px" }}>{item.label}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {item.subMetrics.map((m) => (
          <span
            key={m}
            style={{
              background: "#F5F6FC",
              color: "#6E7180",
              fontSize: 11,
              borderRadius: 8,
              padding: "3px 8px",
              fontWeight: 500,
            }}
          >
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}

function PercentileBar({ item }: { item: (typeof percentileData)[number] }) {
  const barRef = useRef<HTMLDivElement>(null);
  const [animated, setAnimated] = useState(false);

  const startAnimation = useCallback(() => setAnimated(true), []);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { startAnimation(); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [startAnimation]);

  const pct = item.percentile;
  const barColor = pct > 60 ? "#27AE60" : pct >= 40 ? "#F39C12" : "#E74C3C";
  const numColor = pct > 60 ? "#27AE60" : pct >= 40 ? "#F39C12" : "#E74C3C";

  return (
    <div ref={barRef} style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#1B1650" }}>{item.metric}</span>
        <span style={{ fontSize: 15, fontWeight: 800, color: numColor }}>{pct}th</span>
      </div>
      <div style={{ height: 8, background: "#EDEFF7", borderRadius: 4, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            borderRadius: 4,
            background: barColor,
            width: animated ? `${pct}%` : "0%",
            transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </div>
      <p style={{ fontSize: 11, color: "#9DA2B3", textAlign: "right", marginTop: 3, fontWeight: 600 }}>
        {item.topPct}
      </p>
    </div>
  );
}

export default function DevelopmentTab() {
  return (
    <div
      className="tab-fade"
      style={{ minHeight: `calc(100dvh - ${NAV_H}px)`, background: "#F5F6FC", paddingBottom: 24 }}
    >
      {/* Header */}
      <div style={{ padding: "24px 20px 4px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1B1650", letterSpacing: "-0.4px", margin: 0 }}>
          Development Hub
        </h1>
        <Image
          src="/mak-logo.jpeg"
          alt="MAK Academy"
          width={56}
          height={28}
          style={{ height: 28, width: "auto", objectFit: "contain" }}
        />
      </div>

      <div style={{ padding: "0 20px" }}>
        {/* ── Coach's Analysis ── */}
        <SectionLabel text="Coach's Analysis" />
        <CoachMessageCard />

        {/* ── Performance Breakdown ── */}
        <SectionLabel text="Performance Breakdown" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {categoryGrades.map((g) => (
            <GradeCard key={g.category} item={g} />
          ))}
        </div>

        {/* ── Season Progression ── */}
        <SectionLabel text="Season Progression" />
        <div style={{ background: "#fff", borderRadius: 12, padding: "16px 4px 12px", boxShadow: cardShadow }}>
          <LineChartClient />
          <p style={{ fontSize: 12, color: "#9DA2B3", textAlign: "center", marginTop: 6 }}>
            #8 in U12 · Top 35% this season
          </p>
        </div>

        {/* ── Percentile Comparison ── */}
        <SectionLabel text="How Kiyan Compares" sub="vs U12 Midfielders on FairplAI" />
        <div style={{ background: "#fff", borderRadius: 12, padding: "16px 16px 4px", boxShadow: cardShadow }}>
          {percentileData.map((item) => (
            <PercentileBar key={item.metric} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
