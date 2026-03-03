"use client";

import { useEffect, useState } from "react";

export type Tab = "home" | "highlights" | "matches" | "development" | "settings";

export default function BottomNav({
  activeTab,
  setActiveTab,
}: {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}) {
  const [highlightPulsed, setHighlightPulsed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHighlightPulsed(true), 800);
    return () => clearTimeout(t);
  }, []);

  const tabs: { id: Tab; label: string; icon: (active: boolean) => React.ReactNode }[] = [
    {
      id: "home",
      label: "Home",
      icon: (active) => (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path
            d="M3 9.5 L11 3 L19 9.5 V19 H14 V14 H8 V19 H3 Z"
            fill={active ? "#4A4AFF" : "none"}
            stroke={active ? "#4A4AFF" : "#6E7180"}
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: "highlights",
      label: "Highlights",
      icon: (active) => (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="11" r="8" stroke={active ? "#4A4AFF" : "#6E7180"} strokeWidth="1.7" fill={active ? "rgba(74,74,255,0.12)" : "none"} />
          <path d="M9.5 8 L15 11 L9.5 14 Z" fill={active ? "#4A4AFF" : "#6E7180"} />
        </svg>
      ),
    },
    {
      id: "matches",
      label: "Matches",
      icon: (active) => (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="3" y="4" width="16" height="14" rx="2" fill={active ? "#4A4AFF" : "none"} stroke={active ? "#4A4AFF" : "#6E7180"} strokeWidth="1.7" />
          <path d="M7 9 L15 9 M7 12.5 L13 12.5 M7 5.5 L7 2.5 M15 5.5 L15 2.5" stroke={active ? "white" : "#6E7180"} strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: "development",
      label: "Development",
      icon: (active) => (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <polyline points="3,16 8,10 12,13 19,6" stroke={active ? "#4A4AFF" : "#6E7180"} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <polyline points="15,6 19,6 19,10" stroke={active ? "#4A4AFF" : "#6E7180"} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      ),
    },
    {
      id: "settings",
      label: "Settings",
      icon: (active) => (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="11" r="3" fill={active ? "#4A4AFF" : "none"} stroke={active ? "#4A4AFF" : "#6E7180"} strokeWidth="1.7" />
          <path d="M11 4 L11 2 M11 20 L11 18 M4 11 L2 11 M20 11 L18 11 M6.1 6.1 L4.7 4.7 M17.3 17.3 L15.9 15.9 M6.1 15.9 L4.7 17.3 M17.3 4.7 L15.9 6.1" stroke={active ? "#4A4AFF" : "#6E7180"} strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: "#fff",
        borderTop: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 -2px 16px rgba(0,0,0,0.06)",
      }}
    >
      <div
        className="flex items-center justify-around"
        style={{
          maxWidth: 480,
          margin: "0 auto",
          paddingBottom: "env(safe-area-inset-bottom, 6px)",
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center gap-0.5 py-2.5 px-2 relative"
              style={{ minWidth: 50, flex: 1 }}
            >
              {isActive && (
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2"
                  style={{ width: 24, height: 3, background: "#4A4AFF", borderRadius: "0 0 3px 3px" }}
                />
              )}
              <span className={tab.id === "highlights" && highlightPulsed && !isActive ? "highlight-pulse" : ""}>
                {tab.icon(isActive)}
              </span>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  color: isActive ? "#4A4AFF" : "#6E7180",
                  letterSpacing: "0.02em",
                  whiteSpace: "nowrap",
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
