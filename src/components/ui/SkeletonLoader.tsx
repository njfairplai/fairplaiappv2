'use client'

import { cn } from '@/lib/cn'

interface SkeletonLoaderProps {
  width?: string | number
  height?: string | number
  borderRadius?: number
  className?: string
  style?: React.CSSProperties
}

/**
 * Animated shimmer placeholder. The `.skeleton` CSS class lives in
 * globals.css (gradient + animation keyframes). Dimensions stay inline
 * because they're caller-controlled runtime values; `style` overrides
 * for callers that need to add margins / specific positioning.
 */
export default function SkeletonLoader({
  width = '100%',
  height = 16,
  borderRadius = 8,
  className,
  style,
}: SkeletonLoaderProps) {
  return (
    <div
      className={cn('skeleton', className)}
      style={{ width, height, borderRadius, ...style }}
    />
  )
}
