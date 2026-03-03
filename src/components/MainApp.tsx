"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import HomeTab from "./HomeTab";
import HighlightsTab from "./HighlightsTab";
import MatchesTab from "./MatchesTab";
import SettingsTab from "./SettingsTab";
import BottomNav, { type Tab } from "./BottomNav";

const DevelopmentTab = dynamic(() => import("./DevelopmentTab"), { ssr: false });

export default function MainApp() {
  const [activeTab, setActiveTab] = useState<Tab>("home");

  const fullHeightTabs: Tab[] = ["home", "highlights"];
  const darkTabs: Tab[] = ["home", "highlights"];
  const isFullHeight = fullHeightTabs.includes(activeTab);
  const isDark = darkTabs.includes(activeTab);

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "0 auto",
        minHeight: "100dvh",
        position: "relative",
        background: isDark ? "#0D1020" : "#F5F6FC",
        overflow: isFullHeight ? "hidden" : "visible",
      }}
    >
      <main
        key={activeTab}
        className="tab-fade"
        style={{
          minHeight: isFullHeight ? "100dvh" : "calc(100dvh - 80px)",
          paddingBottom: isFullHeight ? 0 : 0,
        }}
      >
        {activeTab === "home" && <HomeTab />}
        {activeTab === "highlights" && <HighlightsTab />}
        {activeTab === "matches" && <MatchesTab />}
        {activeTab === "development" && <DevelopmentTab />}
        {activeTab === "settings" && <SettingsTab />}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
