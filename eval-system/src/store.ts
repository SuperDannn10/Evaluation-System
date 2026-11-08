import { useEffect, useState } from 'react'
import type { AppData, Criterion } from './types'

export const MAX = 5
export const SCALE = ['Poor', 'Fair', 'Good', 'Very good', 'Excellent']
export const uid = () => crypto.randomUUID()

const KEY = 'evaluation-system-v1'

export const seed: AppData = {
  criteria: [
    { id: 'c1', name: 'Quality of work', description: 'Accuracy, completeness and polish of deliverables.', weight: 30 },
    { id: 'c2', name: 'Communication', description: 'Clear, timely updates and documentation.', weight: 20 },
    { id: 'c3', name: 'Teamwork', description: 'Shares work fairly and supports others.', weight: 20 },
    { id: 'c4', name: 'Initiative', description: 'Solves problems without being asked.', weight: 15 },
    { id: 'c5', name: 'Punctuality', description: 'Meets deadlines and attends meetings.', weight: 15 },
  ],
  subjects: [
    { id: 's1', name: 'Sample Person A', group: 'Team 1' },
    { id: 's2', name: 'Sample Person B', group: 'Team 1' },
  ],
  evaluations: [],
}

export function useAppData() {
  const [data, setData] = useState<AppData>(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) return JSON.parse(raw) as AppData
    } catch {
      /* fall back to seed data */
    }
    return seed
  })

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data))
    } catch {
      /* storage unavailable */
    }
  }, [data])

  return [data, setData] as const
}

/** Weighted score as a percentage (0-100). */
export function weightedScore(scores: Record<string, number>, criteria: Criterion[]): number {
  const total = criteria.reduce((s, c) => s + c.weight, 0)
  if (!total) return 0
  const earned = criteria.reduce((s, c) => s + ((scores[c.id] ?? 0) / MAX) * c.weight, 0)
  return (earned / total) * 100
}

export function rating(percent: number): string {
  if (percent >= 90) return 'Outstanding'
  if (percent >= 80) return 'Very good'
  if (percent >= 70) return 'Satisfactory'
  if (percent >= 60) return 'Needs improvement'
  return 'Unsatisfactory'
}
