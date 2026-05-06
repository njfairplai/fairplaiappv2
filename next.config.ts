import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Coach top-nav swap (Slice 6.3): the legacy "Video" + "Analysis" tabs
   * are retired in favour of "Highlights" + "Match Center". The old root
   * pages still exist on disk for now (deep-links into sub-routes haven't
   * been migrated), but visiting the bare paths bounces to the new
   * surfaces so coaches don't see stale designs after the relaunch.
   */
  async redirects() {
    return [
      { source: '/coach/web/video',    destination: '/coach/web/highlights',   permanent: false },
      { source: '/coach/web/analysis', destination: '/coach/web/match-center', permanent: false },
    ]
  },
};

export default nextConfig;
