"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { matchHistory, highlights, radarData, type MatchRecord } from "@/data/playerData";

const RadarChartClientDynamic = dynamic(
  () => import("./RadarChartClient"),
  { ssr: false, loading: () => <div style={{ height: 220 }} /> }
);

const NAV_H = 80;

const cardShadow = "0 2px 12px rgba(0,0,0,0.06)";

function scoreColor(score: number) {
  if (score >= 75) return "#27AE60";
  if (score >= 60) return "#F39C12";
  return "#E74C3C";
}

function Chevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 4 L10 8 L6 12" stroke="#9DA2B3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <p style={{ fontSize: 13, fontWeight: 700, color: "#4A4AFF", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10, marginTop: 20 }}>
      {text}
    </p>
  );
}

function MatchDetail({ match, onBack }: { match: MatchRecord; onBack: () => void }) {
  const color = scoreColor(match.score);

  async function shareClip(clip: (typeof highlights)[number]) {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Kiyan Makkawi — ${clip.title} vs ${match.opponent}`,
          text: `${clip.minute} · ${clip.eventType} · fairpl.ai`,
          url: window.location.href,
        });
      }
    } catch { /* silent */ }
  }

  return (
    <div
      className="tab-fade"
      style={{ minHeight: `calc(100dvh - ${NAV_H}px)`, background: "#F5F6FC", paddingBottom: 24 }}
    >
      {/* Back bar */}
      <div
        style={{
          padding: "16px 20px 12px",
          background: "#fff",
          borderBottom: "1px solid rgba(0,0,0,0.05)",
          display: "flex",
          alignItems: "center",
          gap: 6,
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <button
          onClick={onBack}
          style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M13 4 L7 10 L13 16" stroke="#4A4AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#4A4AFF" }}>Matches</span>
        </button>
      </div>

      <div style={{ padding: "16px 20px 0" }}>
        {/* Match header */}
        <div
          style={{
            background: "linear-gradient(135deg, #1B1650 0%, #282689 100%)",
            borderRadius: 16,
            padding: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 16,
            boxShadow: cardShadow,
          }}
        >
          <div>
            <p style={{ fontSize: 12, color: "rgba(245,246,252,0.4)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>vs</p>
            <p style={{ fontSize: 22, fontWeight: 900, color: "#F5F6FC", letterSpacing: "-0.5px" }}>{match.opponent}</p>
            <p style={{ fontSize: 13, color: "rgba(245,246,252,0.45)", marginTop: 4 }}>{match.day} {match.month} 2026 · {match.competition}</p>
          </div>
          <div style={{ background: `${color}22`, border: `2px solid ${color}66`, borderRadius: 14, padding: "12px 16px", textAlign: "center" }}>
            <p style={{ fontSize: 34, fontWeight: 900, color, lineHeight: 1 }}>{match.score}</p>
            <p style={{ fontSize: 10, color: "rgba(245,246,252,0.4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>Score</p>
          </div>
        </div>

        {/* Match Performance */}
        <SectionLabel text="Match Performance" />
        <div style={{ background: "#fff", borderRadius: 14, padding: "12px 0 6px", marginBottom: 0, boxShadow: cardShadow }}>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", padding: "0 16px 8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: "#4A4AFF", opacity: 0.7 }} />
              <span style={{ fontSize: 11, color: "#6E7180", fontWeight: 600 }}>This Match</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: "#d1d5db" }} />
              <span style={{ fontSize: 11, color: "#6E7180", fontWeight: 600 }}>Season Avg</span>
            </div>
          </div>
          <RadarChartClientDynamic data={radarData} />
        </div>

        {/* Physical Stats */}
        <SectionLabel text="Physical Stats" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 0 }}>
          {[
            { label: "Distance", value: "7.4 km", avg: "6.8km", pct: "+9%", color: "#27AE60" },
            { label: "Top Speed", value: "27.3 km/h", avg: "25.1", pct: "+8%", color: "#27AE60" },
            { label: "Sprints", value: "14", avg: "avg 11", pct: "+27%", color: "#27AE60" },
          ].map(({ label, value, avg, pct, color: c }) => (
            <div key={label} style={{ background: "#fff", borderRadius: 14, padding: "14px 10px", textAlign: "center", boxShadow: cardShadow }}>
              <p style={{ fontSize: 17, fontWeight: 900, color: "#1B1650", letterSpacing: "-0.3px", lineHeight: 1 }}>{value}</p>
              <p style={{ fontSize: 10, color: "#9DA2B3", fontWeight: 600, marginTop: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
              <p style={{ fontSize: 10, color: "#9DA2B3", marginTop: 2 }}>{avg}</p>
              <p style={{ fontSize: 11, fontWeight: 700, color: c, marginTop: 2 }}>{pct}</p>
            </div>
          ))}
        </div>

        {/* Highlights */}
        <SectionLabel text="Highlights" />
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }} className="no-scrollbar">
          {highlights.map((clip) => (
            <div
              key={clip.id}
              style={{
                flexShrink: 0,
                width: 160,
                height: 90,
                background: "linear-gradient(135deg, #1B1650, #0D1020)",
                borderRadius: 12,
                position: "relative",
                overflow: "hidden",
                border: "1px solid rgba(74,74,255,0.15)",
              }}
            >
              {/* Play icon */}
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5.5 4 L10.5 7 L5.5 10 Z" fill="white" /></svg>
                </div>
              </div>
              <div style={{ position: "absolute", top: 8, left: 8, fontSize: 10, fontWeight: 700, color: "#fff", background: clip.color, borderRadius: 100, padding: "2px 7px" }}>{clip.eventType}</div>
              <button onClick={() => shareClip(clip)} style={{ position: "absolute", bottom: 8, right: 8, width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                  <path d="M10 3 L10 12" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  <path d="M7 6 L10 3 L13 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 10 L5 16 L15 16 L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div style={{ position: "absolute", bottom: 8, left: 8, fontSize: 10, color: "rgba(245,246,252,0.5)", fontWeight: 600 }}>{clip.minute}</div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div
          style={{
            background: "rgba(74,74,255,0.06)",
            border: "1px solid rgba(74,74,255,0.15)",
            borderRadius: 12,
            padding: "14px 16px",
            marginTop: 20,
          }}
        >
          <p style={{ fontSize: 13, color: "#1B1650", lineHeight: 1.55, margin: 0 }}>
            Kiyan&apos;s physical output was his strongest area this match, ranking in the top 15% for U12 midfielders.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function MatchesTab() {
  const [selectedMatch, setSelectedMatch] = useState<MatchRecord | null>(null);

  if (selectedMatch) {
    return <MatchDetail match={selectedMatch} onBack={() => setSelectedMatch(null)} />;
  }

  return (
    <div
      className="tab-fade"
      style={{ minHeight: `calc(100dvh - ${NAV_H}px)`, background: "#F5F6FC", paddingBottom: 24 }}
    >
      {/* Header */}
      <div style={{ padding: "24px 20px 4px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1B1650", letterSpacing: "-0.4px", margin: 0 }}>
          Matches &amp; Schedule
        </h1>
      </div>

      <div style={{ padding: "0 20px" }}>
        {/* ── Upcoming Sessions ── */}
        <SectionLabel text="Upcoming" />
        {[
          { type: "training", icon: "🏃", title: "Training Session", subtitle: "Tuesday, Mar 3 · 17:00 – 19:00", venue: "Pitch 2 · MAK Academy", barColor: "#27AE60" },
          { type: "match", icon: "⚽", title: "Match vs Dubai SC", subtitle: "Saturday, Mar 7 · 15:00 KO", venue: "Al Wasl Sports Club", barColor: "#4A4AFF" },
          { type: "training", icon: "🏃", title: "Training Session", subtitle: "Tuesday, Mar 10 · 17:00 – 19:00", venue: "Pitch 2 · MAK Academy", barColor: "#27AE60" },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              background: "#fff",
              borderRadius: 12,
              marginBottom: 10,
              display: "flex",
              overflow: "hidden",
              boxShadow: cardShadow,
            }}
          >
            {/* Colored left bar */}
            <div style={{ width: 4, background: s.barColor, flexShrink: 0 }} />
            <div style={{ flex: 1, padding: "14px 14px 14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#1B1650", margin: 0 }}>{s.title}</p>
                <p style={{ fontSize: 13, color: "#6E7180", marginTop: 2 }}>{s.subtitle}</p>
              </div>
              <p style={{ fontSize: 12, color: "#9DA2B3", textAlign: "right", flexShrink: 0, maxWidth: 100 }}>{s.venue}</p>
            </div>
          </div>
        ))}

        {/* ── Season Overview ── */}
        <SectionLabel text="Season Overview" />
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 0, boxShadow: cardShadow }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
            {[
              { value: "23", label: "Matches" },
              { value: "8", label: "Goals" },
              { value: "12", label: "Assists" },
              { value: "6.9km", label: "Avg Dist" },
            ].map(({ value, label }, i, arr) => (
              <div
                key={label}
                style={{
                  textAlign: "center",
                  borderRight: i < arr.length - 1 ? "1px solid #EDEFF7" : "none",
                  padding: "4px 0",
                }}
              >
                <p style={{ fontSize: 22, fontWeight: 800, color: "#1B1650", letterSpacing: "-0.5px", margin: 0 }}>{value}</p>
                <p style={{ fontSize: 12, color: "#6E7180", marginTop: 2 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Match History ── */}
        <SectionLabel text="Match History" />
        {matchHistory.map((m) => {
          const c = scoreColor(m.score);
          return (
            <button
              key={m.id}
              onClick={() => setSelectedMatch(m)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "14px 16px",
                marginBottom: 8,
                width: "100%",
                textAlign: "left",
                cursor: "pointer",
                boxShadow: cardShadow,
              }}
            >
              {/* Date block */}
              <div style={{ width: 44, height: 50, borderRadius: 10, background: "#F5F6FC", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: "#1B1650", lineHeight: 1 }}>{m.day}</span>
                <span style={{ fontSize: 11, color: "#6E7180", textTransform: "uppercase", letterSpacing: "0.04em" }}>{m.month}</span>
              </div>
              {/* Center */}
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#1B1650", margin: 0 }}>{m.opponent}</p>
                <p style={{ fontSize: 12, color: "#9DA2B3", marginTop: 2 }}>{m.competition}</p>
                <p style={{ fontSize: 12, color: "#9DA2B3" }}>{m.duration}</p>
              </div>
              {/* Score */}
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 22, fontWeight: 900, color: c, margin: 0, lineHeight: 1 }}>{m.score}</p>
                <p style={{ fontSize: 10, color: "#9DA2B3", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>score</p>
              </div>
              <Chevron />
            </button>
          );
        })}
      </div>
    </div>
  );
}
