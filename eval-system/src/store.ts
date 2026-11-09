import { useEffect, useState } from 'react'
import type { AppData, Criterion, Subject } from './types'

export const MAX = 5
export const SCALE = ['Poor', 'Fair', 'Good', 'Very good', 'Excellent']
export const uid = () => crypto.randomUUID()

const KEY = 'evaluation-system-v1'

const bsitTeachers: Subject[] = [
  { id: 'bsit-1', name: 'Ms. Alyssa Mendoza', title: 'BSIT Instructor', group: 'BSIT Department', subjects: ['Programming 1', 'Web Development'] },
  { id: 'bsit-2', name: 'Mr. Miguel Reyes', title: 'BSIT Instructor', group: 'BSIT Department', subjects: ['Data Structures and Algorithms', 'Object-Oriented Programming'] },
  { id: 'bsit-3', name: 'Ms. Bianca Santos', title: 'BSIT Instructor', group: 'BSIT Department', subjects: ['Database Management', 'Information Management'] },
  { id: 'bsit-4', name: 'Mr. Joshua Dela Cruz', title: 'BSIT Instructor', group: 'BSIT Department', subjects: ['Computer Networks', 'Network Administration'] },
  { id: 'bsit-5', name: 'Ms. Nicole Garcia', title: 'BSIT Instructor', group: 'BSIT Department', subjects: ['Human-Computer Interaction', 'UI/UX Design'] },
  { id: 'bsit-6', name: 'Mr. Rafael Bautista', title: 'BSIT Instructor', group: 'BSIT Department', subjects: ['Software Engineering', 'Systems Analysis and Design'] },
  { id: 'bsit-7', name: 'Ms. Camille Navarro', title: 'BSIT Instructor', group: 'BSIT Department', subjects: ['Cybersecurity Fundamentals', 'Information Assurance'] },
  { id: 'bsit-8', name: 'Mr. Enzo Villanueva', title: 'BSIT Instructor', group: 'BSIT Department', subjects: ['Operating Systems', 'Platform Technologies'] },
]

export const seed: AppData = {
  criteria: [
    { id: 'c1', name: 'Subject knowledge', description: 'Demonstrates mastery of the lesson and explains concepts clearly.', weight: 30 },
    { id: 'c2', name: 'Communication', description: 'Speaks clearly, listens well, and encourages student understanding.', weight: 20 },
    { id: 'c3', name: 'Lesson preparation', description: 'Organizes materials, objectives, and activities effectively.', weight: 20 },
    { id: 'c4', name: 'Student engagement', description: 'Keeps students active, motivated, and involved in learning.', weight: 15 },
    { id: 'c5', name: 'Professionalism', description: 'Shows respect, reliability, and a positive classroom presence.', weight: 15 },
  ],
  subjects: [
    {
      id: 't1',
      name: 'Ms. Angela Santos',
      title: 'Science Instructor',
      group: 'Science Department',
      email: 'a.santos@ccdi.edu.ph',
      subjects: ['General Science', 'Biology'],
    },
    {
      id: 't2',
      name: 'Mr. Daniel Cruz',
      title: 'Mathematics Instructor',
      group: 'Mathematics Department',
      email: 'd.cruz@ccdi.edu.ph',
      subjects: ['Mathematics', 'Statistics'],
    },
    ...bsitTeachers,
  ],
  evaluations: [],
}

function addBsitTeachers(data: AppData): AppData {
  const existingIds = new Set(data.subjects.map((subject) => subject.id))
  const subjects = [
    ...data.subjects.map((subject) => {
      const teacher = bsitTeachers.find((entry) => entry.id === subject.id)
      if (!teacher) return subject
      const baseName = teacher.name.replace(/^(Mr\.|Ms\.)\s*/, '')
      return {
        ...subject,
        name: subject.name === baseName ? teacher.name : subject.name,
        title: subject.title === 'Sample BSIT Instructor' ? teacher.title : subject.title,
        ...(subject.avatar === '/teacher-placeholder.svg' ? { avatar: undefined } : {}),
      }
    }),
    ...bsitTeachers.filter((teacher) => !existingIds.has(teacher.id)),
  ]

  return subjects === data.subjects ? data : { ...data, subjects }
}

export function useAppData() {
  const [data, setData] = useState<AppData>(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) return addBsitTeachers(JSON.parse(raw) as AppData)
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
