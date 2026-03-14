export type SquadSize = 5 | 7 | 9 | 11

export interface FormationPosition {
  role: string
  x: number // % across pitch width (0=left, 100=right)
  y: number // % down pitch (0=own goal, 100=opponent goal)
}

export interface Formation {
  id: string
  label: string
  squadSize: SquadSize
  positions: FormationPosition[]
}

export const SQUAD_SIZES: { size: SquadSize; label: string; description: string }[] = [
  { size: 5, label: '5-a-side', description: '1 GK + 4 outfield' },
  { size: 7, label: '7-a-side', description: '1 GK + 6 outfield' },
  { size: 9, label: '9-a-side', description: '1 GK + 8 outfield' },
  { size: 11, label: '11-a-side', description: '1 GK + 10 outfield' },
]

const GK: FormationPosition = { role: 'GK', x: 50, y: 6 }

export const FORMATIONS: Record<SquadSize, Formation[]> = {
  5: [
    {
      id: '5v5_1-2-1', label: '1-2-1', squadSize: 5,
      positions: [GK, { role: 'CB', x: 50, y: 30 }, { role: 'LM', x: 22, y: 55 }, { role: 'RM', x: 78, y: 55 }, { role: 'ST', x: 50, y: 80 }],
    },
    {
      id: '5v5_2-1-1', label: '2-1-1', squadSize: 5,
      positions: [GK, { role: 'LB', x: 30, y: 28 }, { role: 'RB', x: 70, y: 28 }, { role: 'CM', x: 50, y: 55 }, { role: 'ST', x: 50, y: 80 }],
    },
    {
      id: '5v5_1-1-2', label: '1-1-2', squadSize: 5,
      positions: [GK, { role: 'CB', x: 50, y: 25 }, { role: 'CM', x: 50, y: 50 }, { role: 'LW', x: 30, y: 78 }, { role: 'RW', x: 70, y: 78 }],
    },
  ],
  7: [
    {
      id: '7v7_2-3-1', label: '2-3-1', squadSize: 7,
      positions: [GK, { role: 'LB', x: 28, y: 25 }, { role: 'RB', x: 72, y: 25 }, { role: 'LM', x: 22, y: 52 }, { role: 'CM', x: 50, y: 48 }, { role: 'RM', x: 78, y: 52 }, { role: 'ST', x: 50, y: 78 }],
    },
    {
      id: '7v7_3-2-1', label: '3-2-1', squadSize: 7,
      positions: [GK, { role: 'LB', x: 22, y: 25 }, { role: 'CB', x: 50, y: 22 }, { role: 'RB', x: 78, y: 25 }, { role: 'LM', x: 32, y: 52 }, { role: 'RM', x: 68, y: 52 }, { role: 'ST', x: 50, y: 78 }],
    },
    {
      id: '7v7_2-1-2-1', label: '2-1-2-1', squadSize: 7,
      positions: [GK, { role: 'LB', x: 28, y: 22 }, { role: 'RB', x: 72, y: 22 }, { role: 'CDM', x: 50, y: 40 }, { role: 'LM', x: 28, y: 60 }, { role: 'RM', x: 72, y: 60 }, { role: 'ST', x: 50, y: 80 }],
    },
  ],
  9: [
    {
      id: '9v9_3-3-2', label: '3-3-2', squadSize: 9,
      positions: [GK, { role: 'LB', x: 20, y: 22 }, { role: 'CB', x: 50, y: 20 }, { role: 'RB', x: 80, y: 22 }, { role: 'LM', x: 22, y: 48 }, { role: 'CM', x: 50, y: 45 }, { role: 'RM', x: 78, y: 48 }, { role: 'LW', x: 35, y: 75 }, { role: 'RW', x: 65, y: 75 }],
    },
    {
      id: '9v9_3-2-3', label: '3-2-3', squadSize: 9,
      positions: [GK, { role: 'LB', x: 20, y: 22 }, { role: 'CB', x: 50, y: 20 }, { role: 'RB', x: 80, y: 22 }, { role: 'LM', x: 35, y: 48 }, { role: 'RM', x: 65, y: 48 }, { role: 'LW', x: 20, y: 75 }, { role: 'ST', x: 50, y: 78 }, { role: 'RW', x: 80, y: 75 }],
    },
    {
      id: '9v9_2-4-2', label: '2-4-2', squadSize: 9,
      positions: [GK, { role: 'LB', x: 30, y: 22 }, { role: 'RB', x: 70, y: 22 }, { role: 'LM', x: 18, y: 48 }, { role: 'CM', x: 40, y: 45 }, { role: 'CM', x: 60, y: 45 }, { role: 'RM', x: 82, y: 48 }, { role: 'LW', x: 35, y: 75 }, { role: 'RW', x: 65, y: 75 }],
    },
  ],
  11: [
    {
      id: '11v11_4-3-3', label: '4-3-3', squadSize: 11,
      positions: [
        GK,
        { role: 'LB', x: 12, y: 25 }, { role: 'CB', x: 36, y: 22 }, { role: 'CB', x: 64, y: 22 }, { role: 'RB', x: 88, y: 25 },
        { role: 'CM', x: 28, y: 48 }, { role: 'CM', x: 50, y: 45 }, { role: 'CM', x: 72, y: 48 },
        { role: 'LW', x: 15, y: 72 }, { role: 'ST', x: 50, y: 78 }, { role: 'RW', x: 85, y: 72 },
      ],
    },
    {
      id: '11v11_4-4-2', label: '4-4-2', squadSize: 11,
      positions: [
        GK,
        { role: 'LB', x: 12, y: 25 }, { role: 'CB', x: 36, y: 22 }, { role: 'CB', x: 64, y: 22 }, { role: 'RB', x: 88, y: 25 },
        { role: 'LM', x: 15, y: 48 }, { role: 'CM', x: 38, y: 45 }, { role: 'CM', x: 62, y: 45 }, { role: 'RM', x: 85, y: 48 },
        { role: 'ST', x: 38, y: 75 }, { role: 'ST', x: 62, y: 75 },
      ],
    },
    {
      id: '11v11_3-5-2', label: '3-5-2', squadSize: 11,
      positions: [
        GK,
        { role: 'CB', x: 25, y: 22 }, { role: 'CB', x: 50, y: 20 }, { role: 'CB', x: 75, y: 22 },
        { role: 'LWB', x: 10, y: 45 }, { role: 'CM', x: 32, y: 48 }, { role: 'CM', x: 50, y: 45 }, { role: 'CM', x: 68, y: 48 }, { role: 'RWB', x: 90, y: 45 },
        { role: 'ST', x: 38, y: 75 }, { role: 'ST', x: 62, y: 75 },
      ],
    },
    {
      id: '11v11_4-2-3-1', label: '4-2-3-1', squadSize: 11,
      positions: [
        GK,
        { role: 'LB', x: 12, y: 22 }, { role: 'CB', x: 36, y: 20 }, { role: 'CB', x: 64, y: 20 }, { role: 'RB', x: 88, y: 22 },
        { role: 'CDM', x: 38, y: 40 }, { role: 'CDM', x: 62, y: 40 },
        { role: 'LW', x: 18, y: 62 }, { role: 'CAM', x: 50, y: 58 }, { role: 'RW', x: 82, y: 62 },
        { role: 'ST', x: 50, y: 80 },
      ],
    },
  ],
}
