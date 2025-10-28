export type Criterion = {
  id: string
  name: string
  weight: number
}

export type Alternative = {
  id: string
  name: string
  description?: string
  weight: number
  imageUrl?: string | null
}

export type AHPProject = {
  id: string
  goal: string
  criteria: Criterion[]
  alternatives: Alternative[]
  createdAt: Date
  updatedAt: Date
}

