import type { Player } from '@/lib/types'

export type ClusterId = 'GK' | 'LB' | 'CB' | 'RB' | 'CM' | 'LW' | 'RW' | 'ST'

export interface Cluster {
  id: ClusterId
  label: string
  /** Centre of the cluster on the pitch as % from left (x) and from BOTTOM (y).
   *  Pitch is rendered attacking up: GK at the bottom, ST at the top. */
  cx: number
  cy: number
  /** Match these Player.position string values into this cluster. */
  positions: string[]
}

export const CLUSTERS: Cluster[] = [
  { id: 'GK', label: 'Keepers',     cx: 50, cy: 8,  positions: ['GK'] },
  { id: 'LB', label: 'Left back',   cx: 22, cy: 28, positions: ['LB', 'LWB'] },
  { id: 'CB', label: 'Centre back', cx: 50, cy: 26, positions: ['CB', 'SW'] },
  { id: 'RB', label: 'Right back',  cx: 78, cy: 28, positions: ['RB', 'RWB'] },
  { id: 'CM', label: 'Midfield',    cx: 50, cy: 50, positions: ['CM', 'CDM', 'CAM', 'DM', 'AM'] },
  { id: 'LW', label: 'Left wing',   cx: 22, cy: 70, positions: ['LW', 'LM'] },
  { id: 'RW', label: 'Right wing',  cx: 78, cy: 70, positions: ['RW', 'RM'] },
  { id: 'ST', label: 'Striker',     cx: 50, cy: 88, positions: ['ST', 'CF', 'FW'] },
]

const POSITION_TO_CLUSTER: Record<string, ClusterId> = (() => {
  const map: Record<string, ClusterId> = {}
  for (const c of CLUSTERS) for (const p of c.positions) map[p] = c.id
  return map
})()

/** Find the cluster a player belongs to using their primary position.
 *  Falls back to CM for unknown positions so nobody disappears. */
export function getClusterForPlayer(player: Player): ClusterId {
  const primary = player.position[0]
  return POSITION_TO_CLUSTER[primary] ?? 'CM'
}

/** Pack N players inside a cluster's pitch zone. Returns absolute (%) coords
 *  per player. Layout fans out compactly:
 *    1 → centred on (cx, cy)
 *    2 → side-by-side horizontally
 *    3 → triangle (one above two)
 *    4 → 2×2
 *    5+ → 2-column stack
 *  Positions are deterministic — sort the input players upstream if you want
 *  a stable arrangement. */
export function layoutPlayersInCluster(
  players: Player[],
  cluster: Cluster,
): { player: Player; x: number; y: number }[] {
  const n = players.length
  if (n === 0) return []
  const W = 16 // total horizontal spread in % across the cluster
  const H = 14 // total vertical spread in % across the cluster
  const slots: Array<[number, number]> = []
  if (n === 1) {
    slots.push([0, 0])
  } else if (n === 2) {
    slots.push([-W / 4, 0], [W / 4, 0])
  } else if (n === 3) {
    slots.push([0, -H / 3], [-W / 3, H / 4], [W / 3, H / 4])
  } else if (n === 4) {
    slots.push([-W / 4, -H / 4], [W / 4, -H / 4], [-W / 4, H / 4], [W / 4, H / 4])
  } else {
    // 5+: 2-column stack, evenly spaced vertically
    const rows = Math.ceil(n / 2)
    for (let i = 0; i < n; i++) {
      const row = Math.floor(i / 2)
      const col = i % 2
      const xOff = col === 0 ? -W / 4 : W / 4
      const yOff = -H / 2 + (row + 0.5) * (H / rows)
      slots.push([xOff, yOff])
    }
  }
  return players.map((p, i) => {
    const [dx, dy] = slots[i]
    return { player: p, x: cluster.cx + dx, y: cluster.cy + dy }
  })
}
