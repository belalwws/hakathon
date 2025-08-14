"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface TeamMember {
  name: string
  role: string
}

interface Team {
  id: string
  name: string
  projectName: string
  members: TeamMember[]
  timestamp: string
}

interface Evaluation {
  teamId: string
  judgeId: string
  scores: Record<string, number>
  comments: Record<string, string>
  weightedScore: number
  timestamp: string
}

interface EvaluationContextType {
  currentTeam: Team | null
  evaluations: Evaluation[]
  currentStage: number
  setCurrentTeam: (team: Team) => void
  setCurrentStage: (stage: number) => void
  saveEvaluation: (scores: Record<string, number>, comments: Record<string, string>) => void
  getAllResults: () => Array<{ team: Team; evaluation: Evaluation }>
  resetEvaluation: () => void
}

const EvaluationContext = createContext<EvaluationContextType | undefined>(undefined)

function safeParseJSON(str: string) {
  try {
    if (!str || str === "undefined" || str === "null") {
      return null
    }
    return JSON.parse(str)
  } catch {
    return null
  }
}

function safeStringifyJSON(obj: any) {
  try {
    return JSON.stringify(obj)
  } catch {
    return ""
  }
}

export function EvaluationProvider({ children }: { children: ReactNode }) {
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null)
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [currentStage, setCurrentStage] = useState(0)

  useEffect(() => {
    const loadEvaluations = () => {
      try {
        if (typeof window !== "undefined") {
          const savedEvaluations = localStorage.getItem("hackathon_evaluations")
          const parsedEvaluations = safeParseJSON(savedEvaluations || "")
          if (Array.isArray(parsedEvaluations)) {
            setEvaluations(parsedEvaluations)
          }
        }
      } catch (error) {
        console.error("خطأ في تحميل التقييمات:", error)
        if (typeof window !== "undefined") {
          localStorage.removeItem("hackathon_evaluations")
        }
      }
    }

    loadEvaluations()
  }, [])

  useEffect(() => {
    const saveEvaluations = () => {
      try {
        if (typeof window !== "undefined" && evaluations.length > 0) {
          const evaluationsString = safeStringifyJSON(evaluations)
          if (evaluationsString) {
            localStorage.setItem("hackathon_evaluations", evaluationsString)
          }
        }
      } catch (error) {
        console.error("خطأ في حفظ التقييمات:", error)
      }
    }

    saveEvaluations()
  }, [evaluations])

  const saveEvaluation = (scores: Record<string, number>, comments: Record<string, string>) => {
    if (!currentTeam) return

    const weights = {
      strategic: 0.2,
      innovation: 0.25,
      feasibility: 0.25,
      impact: 0.2,
      presentation: 0.1,
    }

    let weightedScore = 0
    Object.entries(scores).forEach(([key, score]) => {
      weightedScore += score * (weights[key as keyof typeof weights] || 0)
    })

    const evaluation: Evaluation = {
      teamId: currentTeam.id,
      judgeId: "current-judge",
      scores,
      comments,
      weightedScore: Math.round(weightedScore * 100) / 100,
      timestamp: new Date().toISOString(),
    }

    setEvaluations((prev) => [...prev, evaluation])
  }

  const getAllResults = () => {
    return evaluations.map((evaluation) => ({
      team: currentTeam!,
      evaluation,
    }))
  }

  const resetEvaluation = () => {
    setCurrentTeam(null)
    setCurrentStage(0)
    setEvaluations([])
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("hackathon_evaluations")
        localStorage.removeItem("hackathon_current_team")
      }
    } catch (error) {
      console.error("خطأ في مسح التقييمات:", error)
    }
  }

  return (
    <EvaluationContext.Provider
      value={{
        currentTeam,
        evaluations,
        currentStage,
        setCurrentTeam,
        setCurrentStage,
        saveEvaluation,
        getAllResults,
        resetEvaluation,
      }}
    >
      {children}
    </EvaluationContext.Provider>
  )
}

export function useEvaluation() {
  const context = useContext(EvaluationContext)
  if (context === undefined) {
    throw new Error("useEvaluation must be used within an EvaluationProvider")
  }
  return context
}
