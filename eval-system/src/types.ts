export interface Criterion {
  id: string
  name: string
  description: string
  weight: number
}

export interface Subject {
  id: string
  name: string
  group: string
  title?: string
  email?: string
  avatar?: string
  subjects?: string[]
}

export interface Evaluation {
  id: string
  subjectId: string
  evaluator: string
  scores: Record<string, number>
  comment: string
  date: string
  subject?: string
  isAnonymous?: boolean
}

export interface AppData {
  criteria: Criterion[]
  subjects: Subject[]
  evaluations: Evaluation[]
}
