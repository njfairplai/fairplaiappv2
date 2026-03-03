"use client";

export default function EagleLogo({
  size = 36,
  color = "#F5F6FC",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Eagle body */}
      <ellipse cx="20" cy="23" rx="5" ry="7" fill={color} opacity="0.9" />
      {/* Left wing */}
      <path
        d="M15 22 C10 18, 4 20, 2 16 C6 14, 12 16, 15 19 Z"
        fill={color}
        opacity="0.95"
      />
      {/* Right wing */}
      <path
        d="M25 22 C30 18, 36 20, 38 16 C34 14, 28 16, 25 19 Z"
        fill={color}
        opacity="0.95"
      />
      {/* Wing sweep left */}
      <path
        d="M15 20 C9 15, 3 14, 1 10 C6 11, 13 15, 15 18 Z"
        fill={color}
        opacity="0.7"
      />
      {/* Wing sweep right */}
      <path
        d="M25 20 C31 15, 37 14, 39 10 C34 11, 27 15, 25 18 Z"
        fill={color}
        opacity="0.7"
      />
      {/* Head */}
      <circle cx="20" cy="14" r="4.5" fill={color} />
      {/* Beak */}
      <path d="M22 15 L25 16.5 L22 17 Z" fill="#F59E0B" />
      {/* Eye */}
      <circle cx="21.5" cy="13.5" r="1" fill="#1B1650" />
      {/* Tail feathers */}
      <path
        d="M18 30 L16 37 M20 30 L20 38 M22 30 L24 37"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  );
}
