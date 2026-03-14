"use client";

import { useState } from "react";
import Image from "next/image";
import { player } from "@/data/playerData";

const NAV_H = 80;

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      style={{
        width: 48,
        height: 28,
        borderRadius: 100,
        background: value ? "#4A4AFF" : "#D1D5DB",
        border: "none",
        cursor: "pointer",
        position: "relative",
        flexShrink: 0,
        transition: "background 0.22s ease",
        padding: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: value ? 23 : 3,
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.22)",
          transition: "left 0.22s ease",
          display: "block",
        }}
      />
    </button>
  );
}

function RowDivider() {
  return <div style={{ height: 1, background: "rgba(0,0,0,0.05)", marginLeft: 16 }} />;
}

function ChevronRow({ label, sub }: { label: string; sub?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", height: 52 }}>
      <span style={{ fontSize: 15, fontWeight: 500, color: "#1B1650" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {sub && <span style={{ fontSize: 14, color: "#9DA2B3" }}>{sub}</span>}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 4 L10 8 L6 12" stroke="#9DA2B3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

function ToggleRow({ label, sub, value, onChange }: { label: string; sub?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", height: 52 }}>
      <span style={{ fontSize: 15, fontWeight: 500, color: "#1B1650" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {sub && <span style={{ fontSize: 13, color: "#9DA2B3" }}>{sub}</span>}
        <Toggle value={value} onChange={onChange} />
      </div>
    </div>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <p style={{ fontSize: 13, fontWeight: 700, color: "#6E7180", letterSpacing: "0.08em", textTransform: "uppercase", margin: "20px 0 8px" }}>
      {text}
    </p>
  );
}

export default function SettingsTab() {
  const [notifs, setNotifs] = useState({
    newMatch: true,
    highlights: true,
    weekly: true,
    monthly: false,
  });

  const [delivery, setDelivery] = useState({
    whatsapp: true,
    email: true,
  });

  function handleDeleteData() {
    window.alert("Your deletion request has been submitted. We will process this within 30 days.");
  }

  function handleSignOut() {
    const ok = window.confirm("Are you sure you want to sign out?");
    if (ok) {
      // demo only
    }
  }

  return (
    <div
      className="tab-fade"
      style={{ minHeight: `calc(100dvh - ${NAV_H}px)`, background: "#F5F6FC", paddingBottom: 32 }}
    >
      {/* FairplAI logo */}
      <div style={{ paddingTop: 28, display: "flex", justifyContent: "center" }}>
        <Image
          src="/logo-black.png"
          alt="FairplAI"
          width={100}
          height={30}
          style={{ height: 30, width: "auto", objectFit: "contain" }}
        />
      </div>

      {/* Profile row */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          padding: "20px 20px 0",
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            overflow: "hidden",
            position: "relative",
            border: "2px solid rgba(74,74,255,0.2)",
          }}
        >
          <Image
            src="/kiyan.jpg"
            alt={player.name}
            fill
            style={{ objectFit: "cover", objectPosition: "center top" }}
          />
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 16, fontWeight: 800, color: "#1B1650", margin: 0 }}>{player.name}</p>
          <p style={{ fontSize: 13, color: "#6E7180", marginTop: 2 }}>{player.academy} · {player.team}</p>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "#EDEFF7", margin: "20px 20px 0" }} />

      <div style={{ padding: "0 20px" }}>
        {/* Notifications */}
        <SectionLabel text="Notifications" />
        <SectionCard>
          <ToggleRow label="New match analysed" value={notifs.newMatch} onChange={(v) => setNotifs((s) => ({ ...s, newMatch: v }))} />
          <RowDivider />
          <ToggleRow label="New highlights" value={notifs.highlights} onChange={(v) => setNotifs((s) => ({ ...s, highlights: v }))} />
          <RowDivider />
          <ToggleRow label="Weekly summary" value={notifs.weekly} onChange={(v) => setNotifs((s) => ({ ...s, weekly: v }))} />
          <RowDivider />
          <ToggleRow label="Monthly report" value={notifs.monthly} onChange={(v) => setNotifs((s) => ({ ...s, monthly: v }))} />
        </SectionCard>

        {/* Delivery */}
        <SectionLabel text="Delivery" />
        <SectionCard>
          <ToggleRow label="WhatsApp" sub="+971 50 123 4567" value={delivery.whatsapp} onChange={(v) => setDelivery((s) => ({ ...s, whatsapp: v }))} />
          <RowDivider />
          <ToggleRow label="Email" sub="parent@email.com" value={delivery.email} onChange={(v) => setDelivery((s) => ({ ...s, email: v }))} />
        </SectionCard>

        {/* App */}
        <SectionLabel text="App" />
        <SectionCard>
          <ChevronRow label="Language" sub="English" />
          <RowDivider />
          <ChevronRow label="Timezone" sub="UAE (GMT+4)" />
        </SectionCard>

        {/* Support */}
        <SectionLabel text="Support" />
        <SectionCard>
          <ChevronRow label="Help Centre" />
          <RowDivider />
          <ChevronRow label="Contact Support" />
          <RowDivider />
          <ChevronRow label="Privacy Policy" />
          <RowDivider />
          <ChevronRow label="Terms of Service" />
        </SectionCard>

        {/* Account */}
        <SectionLabel text="Account" />
        <SectionCard>
          <ChevronRow label="Change Password" />
          <RowDivider />
          <button
            onClick={handleDeleteData}
            style={{ display: "block", width: "100%", height: 52, padding: "0 16px", textAlign: "left", background: "none", border: "none", cursor: "pointer", fontSize: 15, fontWeight: 500, color: "#E74C3C" }}
          >
            Request Data Deletion
          </button>
          <RowDivider />
          <button
            onClick={handleSignOut}
            style={{ display: "block", width: "100%", height: 52, padding: "0 16px", textAlign: "left", background: "none", border: "none", cursor: "pointer", fontSize: 15, fontWeight: 500, color: "#E74C3C" }}
          >
            Sign Out
          </button>
        </SectionCard>

        {/* Version */}
        <p style={{ fontSize: 12, color: "#9DA2B3", textAlign: "center", marginTop: 24 }}>
          FairPlai Parent/Player Portal · v2.0.0<br />
          <span style={{ fontSize: 11, opacity: 0.7 }}>fairpl.ai · Made for GCC football families</span>
        </p>
      </div>
    </div>
  );
}
