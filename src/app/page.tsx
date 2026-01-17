"use client";

import dynamic from "next/dynamic";

const PosterBuilder = dynamic(
  () => import("@/components/PosterBuilder").then((mod) => mod.PosterBuilder),
  {
    ssr: false,
    loading: () => (
      <div className="h-screen flex items-center justify-center">
        <div className="text-lg">Loading Poster Builder...</div>
      </div>
    ),
  }
);

export default function Home() {
  return <PosterBuilder />;
}