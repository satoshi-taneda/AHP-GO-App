"use client"

import type React from "react"
import type { AHPProject, Criterion, Alternative } from "@/lib/types"
import { createContext, useContext, useState, useCallback } from "react"
import { supabase } from "@/lib/supabaseClient"

interface AHPContextType {
  project: AHPProject | null
  setProject: (project: AHPProject) => void
  updateGoal: (goal: string) => void
  addCriterion: (name: string, weight: number) => void
  updateCriterion: (id: string, updates: Partial<Criterion>) => void
  deleteCriterion: (id: string) => void
  addAlternative: (name: string, description: string, imageUrl: string) => void
  updateAlternative: (id: string, updates: Partial<Alternative>) => void
  deleteAlternative: (id: string) => void
  fetchAlternatives: (projectId: string) => void
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function createDefaultProject(): AHPProject { return {
    id: generateId(),
    goal: "",
    criteria: defaultCriteria,
    alternatives: defaultAlternative,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

const AHPContext = createContext<AHPContextType | undefined>(undefined)

// 初期プロジェクト
const defaultCriteria: Criterion[] = [
  { id: generateId(), name: "手軽さ", weight: 0 },
  { id: generateId(), name: "デザイン", weight: 0 },
  { id: generateId(), name: "性能", weight: 0 },
]
const defaultAlternative: Alternative[] = [
  { id: generateId(), name: "商品A", description: "価格: XXXXX円 商品説明: ...", weight: 0, imageUrl: ""},
  { id: generateId(), name: "商品B", description: "価格: XXXXX円 商品説明: ...", weight: 0, imageUrl: ""},
  { id: generateId(), name: "商品C", description: "価格: XXXXX円 商品説明: ...", weight: 0, imageUrl: ""},
]
/*
const defaultAlternative: Alternative[] = [
  { id: generateId(), name: "Macbook Air", description: "145,600円 13.6インチ M4 16GB SSD:256GB Apple ...", weight: 0, imageUrl: ""},
  { id: generateId(), name: "ThinkPad X1", description: "99,000円 14インチ Ryzen7 32GB SSD:1TB Lenovo ...", weight: 0, imageUrl: ""},
  { id: generateId(), name: "Dell 15", description: "64,775円 15.6インチ Ryzen5 16GB SSD:512GB DELL ...", weight: 0, imageUrl: ""}
]
*/
export const useAHP = () => {
  const context = useContext(AHPContext)
  if (context === undefined) {
    throw new Error("useAHP must be used within an AHPProvider")
  }
  return context
}

export const AHPProvider = ({ children }: { children: React.ReactNode }) => {
  const [project, setProjectState] = useState<AHPProject | null>(createDefaultProject())

  const setProject = useCallback((newProject: AHPProject) => {
      setProjectState(newProject)
  }, [])

  const updateGoal = useCallback((goal: string) => {
    setProjectState((prev: AHPProject | null) =>
      prev
        ? { ...prev, goal, updatedAt: new Date() }
        : createDefaultProject())
  }, [])

  const addCriterion = useCallback((name: string) => {
    const newCriterion: Criterion = {id: generateId(), name, weight: 0 }
    setProjectState((prev: AHPProject | null) =>
      prev
        ? { ...prev, criteria: [...prev.criteria, newCriterion], updatedAt: new Date() }
        : createDefaultProject()
    )
  }, [])

  const updateCriterion =useCallback((id: string, updates: Partial<Criterion>) => {
    setProjectState((prev: AHPProject | null) =>
      prev
        ? {
          ...prev,
          criteria: prev.criteria.map((criterion: Criterion) => criterion.id === id ? { ...criterion, ...updates }: criterion),
          updatedAt: new Date()
          }
        : createDefaultProject()
    )
  }, [])

  const deleteCriterion = useCallback((id: string) => {
    setProjectState((prev: AHPProject | null) =>
      prev
        ? {
          ...prev,
          criteria: prev.criteria.filter((criterion: Criterion) => criterion.id !== id),
          updatedAt: new Date()
          }
        : createDefaultProject()
    )
  }, [])

  const addAlternative = useCallback((name: string, description?: string, imageUrl?: string) => {
    const newAlt: Alternative = {id: generateId(), name, description: description || "", weight: 0, imageUrl: imageUrl ||  null }
    setProjectState((prev) => ({
      ...prev!,
      alternatives: [...(prev?.alternatives || []), newAlt],
    }))
  }, [])

  const updateAlternative = useCallback((id: string, updates: Partial<Alternative>) => {
    setProjectState((prev: AHPProject | null) =>
      prev
        ? {
          ...prev,
          alternatives: prev.alternatives.map((alternative: Alternative) => alternative.id === id ? { ...alternative, ...updates } : alternative),
          updatedAt: new Date()
          }
        : createDefaultProject()
    )
  }, [])

  const deleteAlternative = useCallback((id: string) => {
    setProjectState((prev: AHPProject | null) =>
      prev
        ? {
          ...prev,
          alternatives: prev.alternatives.filter((alternative: Alternative) => alternative.id !== id),
          updatedAt: new Date()
          }
        : createDefaultProject()
    )
  }, [])

  // -- 候補一覧をSupabaseから取得 --
  const fetchAlternatives = useCallback(async (projectId: string) => {
    const { data, error } = await supabase
      .from("alternatives")
      .select("*")
      .eq("project_id", projectId)
      .order("alternatives_id", { ascending: true })
    if (!error) {
    setProjectState((prev: AHPProject | null) =>
      prev ? {...prev, alternatives: data } : prev
    )}
  }, [])

  return (
    <AHPContext.Provider value={
      { project,
        setProject,
        updateGoal,
        addCriterion,
        updateCriterion,
        deleteCriterion,
        addAlternative,
        updateAlternative,
        deleteAlternative,
        fetchAlternatives,
    }}
    >
      {children}
    </AHPContext.Provider>
  )
}

