export type Criterion = {
  id: string
  name: string
}

export type Alternative = {
  id: string
  name: string
  description?: string
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

