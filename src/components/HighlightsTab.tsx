"use client";

import { useState, useRef } from "react";
import { highlights } from "@/data/playerData";

export default function HighlightsTab() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [toastVisible, setToastVisible] = useState(false);
  const touchStartY = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const navHeight = 80;

  function handleTouchStart(e: React.TouchEvent) {
    touchStartY.current = e.touches[0].clientY;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const dy = touchStartY.current - e.changedTouches[0].clientY;
    if (dy > 50 && currentIndex < highlights.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else if (dy < -50 && currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }

  async function handleShare(clip: (typeof highlights)[number]) {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Kiyan Makkawi — ${clip.title} vs Al Wasl Academy`,
          text: "Watch Kiyan's highlight from today's match! 🔥⚽",
          url: window.location.href,
        });
      } else {
        showToast();
      }
    } catch {
      // User cancelled — silent
    }
  }

  function showToast() {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  }

  const clip = highlights[currentIndex];

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        height: `calc(100dvh - ${navHeight}px)`,
        display: "flex",
        flexDirection: "column",
        background: "#0D1020",
        position: "relative",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      {/* Header bar */}
      <div
        style={{
          height: 54,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          background: "#0D1020",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          zIndex: 5,
        }}
      >
        <span style={{ fontSize: 17, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px" }}>
          Kiyan&apos;s Highlights
        </span>
        <span style={{ fontSize: 12, color: "#9DA2B3", fontWeight: 600 }}>
          {highlights.length} clips · Feb 24
        </span>
      </div>

      {/* Clip area */}
      <div
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Current clip */}
        <div
          key={currentIndex}
          className="slide-up-clip"
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(160deg, #1B1650 0%, #0D1020 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Subtle radial glow */}
          <div
            style={{
              position: "absolute",
              top: "30%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 300,
              height: 300,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${clip.color}22 0%, transparent 70%)`,
              pointerEvents: "none",
            }}
          />

          {/* Top-left: event badge */}
          <div
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              background: "rgba(0,0,0,0.45)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 20,
              padding: "6px 12px",
              backdropFilter: "blur(8px)",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
              {clip.eventType}
            </span>
          </div>

          {/* Top-right: duration */}
          <div
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              background: "rgba(0,0,0,0.45)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 20,
              padding: "6px 12px",
              backdropFilter: "blur(8px)",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
              {clip.duration}
            </span>
          </div>

          {/* Centre play button */}
          <div
            style={{
              position: "relative",
              width: 68,
              height: 68,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.12)",
              border: "2px solid rgba(255,255,255,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(12px)",
              cursor: "pointer",
            }}
            className="play-pulse"
          >
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path d="M10 7.5 L20 13 L10 18.5 Z" fill="#4A4AFF" />
            </svg>
          </div>

          {/* Bottom gradient overlay */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "45%",
              background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.8))",
              pointerEvents: "none",
            }}
          />

          {/* Bottom content */}
          <div
            style={{
              position: "absolute",
              bottom: 20,
              left: 20,
              right: 20,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
            }}
          >
            {/* Bottom-left: title + minute */}
            <div>
              <p style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px", lineHeight: 1.1 }}>
                {clip.title}
              </p>
              <p style={{ fontSize: 13, color: "#9DA2B3", marginTop: 3 }}>
                {clip.minute} · Kiyan Makkawi
              </p>
            </div>

            {/* Share button */}
            <button
              onClick={() => handleShare(clip)}
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.13)",
                border: "1px solid rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              {/* Share icon (arrow up from box) */}
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M10 3 L10 13" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M7 6 L10 3 L13 6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 10 L5 16 L15 16 L15 10" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Swipe hint */}
          {currentIndex < highlights.length - 1 && (
            <div
              style={{
                position: "absolute",
                bottom: 70,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                opacity: 0.35,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 6 L8 10 L12 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontSize: 10, color: "#fff", fontWeight: 600 }}>swipe up</span>
            </div>
          )}
        </div>

        {/* Right side dot indicators */}
        <div
          style={{
            position: "absolute",
            right: 14,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            zIndex: 10,
          }}
        >
          {highlights.map((_, i) => (
            <div
              key={i}
              onClick={() => setCurrentIndex(i)}
              style={{
                width: i === currentIndex ? 8 : 5,
                height: i === currentIndex ? 8 : 5,
                borderRadius: "50%",
                background: i === currentIndex ? "#fff" : "#6E7180",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            />
          ))}
        </div>
      </div>

      {/* Toast */}
      {toastVisible && (
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(30,30,36,0.95)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            padding: "10px 20px",
            fontSize: 13,
            color: "#fff",
            fontWeight: 600,
            whiteSpace: "nowrap",
            zIndex: 100,
          }}
        >
          Sharing not supported on this device
        </div>
      )}
    </div>
  );
}
