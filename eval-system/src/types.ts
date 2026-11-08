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
}

export interface Evaluation {
  id: string
  subjectId: string
  evaluator: string
  scores: Record<string, number>
  comment: string
  date: string
}

export interface AppData {
  criteria: Criterion[]
  subjects: Subject[]
  evaluations: Evaluation[]
}
