"use client"

import { useState, useRef, Suspense } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Environment, Float, Html } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEvaluation } from "@/contexts/evaluation-context"
import { useAuth } from "@/contexts/auth-context"
import {
  Star,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Target,
  Lightbulb,
  Cog,
  TrendingUp,
  Presentation,
} from "lucide-react"
import type * as THREE from "three"

interface EvaluationJourneyProps {
  onComplete: () => void
}

const evaluationStages = [
  {
    id: "strategic",
    title: "التوافق مع الأهداف الاستراتيجية",
    weight: 20,
    color: "#3B82F6",
    icon: Target,
    description: "تقييم مدى توافق الفكرة مع رؤية وأهداف المؤسسة",
  },
  {
    id: "innovation",
    title: "ابتكارية الفكرة",
    weight: 25,
    color: "#F59E0B",
    icon: Lightbulb,
    description: "تقييم مستوى الإبداع والجدة في الحل المقترح",
  },
  {
    id: "feasibility",
    title: "قابلية التطبيق",
    weight: 25,
    color: "#10B981",
    icon: Cog,
    description: "تقييم إمكانية تنفيذ الفكرة عملياً وتقنياً",
  },
  {
    id: "impact",
    title: "التأثير على المؤسسة",
    weight: 20,
    color: "#8B5CF6",
    icon: TrendingUp,
    description: "تقييم الأثر المتوقع على أداء وكفاءة المؤسسة",
  },
  {
    id: "presentation",
    title: "مهارات العرض",
    weight: 10,
    color: "#EF4444",
    icon: Presentation,
    description: "تقييم جودة العرض والتقديم والتواصل",
  },
]

function StageEnvironment({ stage }: { stage: (typeof evaluationStages)[0] }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[2, 2, 0.5, 8]} />
          <meshStandardMaterial color={stage.color} />
        </mesh>
      </Float>

      {[...Array(6)].map((_, i) => (
        <Float key={i} speed={0.8 + i * 0.1} rotationIntensity={0.2}>
          <mesh
            position={[Math.cos((i * Math.PI) / 3) * 3, Math.sin(i * 0.5) * 2 + 1, Math.sin((i * Math.PI) / 3) * 3]}
          >
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial color={stage.color} opacity={0.7} transparent />
          </mesh>
        </Float>
      ))}

      <Html position={[0, 3, 0]} center>
        <div className="text-center bg-black/20 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex justify-center mb-2">
            <stage.icon className="w-8 h-8" style={{ color: stage.color }} />
          </div>
          <h3 className="text-white font-semibold text-lg">{stage.title}</h3>
          <p className="text-gray-200 text-sm mt-1">{`الوزن: ${stage.weight}%`}</p>
        </div>
      </Html>
    </group>
  )
}

function StarRating({ rating, onRate, color }: { rating: number; onRate: (rating: number) => void; color: string }) {
  const [hoverRating, setHoverRating] = useState(0)

  return (
    <div className="flex gap-2 justify-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onRate(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          className="transition-all duration-200 hover:scale-110"
        >
          <Star
            size={32}
            fill={star <= (hoverRating || rating) ? color : "transparent"}
            stroke={color}
            className="cursor-pointer"
          />
        </button>
      ))}
    </div>
  )
}

export default function EvaluationJourney({ onComplete }: EvaluationJourneyProps) {
  const { currentStage, setCurrentStage, currentTeam, saveEvaluation } = useEvaluation()
  const { user } = useAuth()
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [comments, setComments] = useState<Record<string, string>>({})

  const currentStageData = evaluationStages[currentStage]

  const handleRating = (stageId: string, rating: number) => {
    setRatings((prev) => ({ ...prev, [stageId]: rating }))
  }

  const handleNext = () => {
    if (currentStage < evaluationStages.length - 1) {
      setCurrentStage(currentStage + 1)
    } else {
      saveEvaluation(ratings, comments)
      onComplete()
    }
  }

  const handlePrev = () => {
    if (currentStage > 0) {
      setCurrentStage(currentStage - 1)
    }
  }

  const canGoNext = ratings[currentStageData.id] > 0
  const isLastStage = currentStage === evaluationStages.length - 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F4FB] to-[#E6E9F2]">
      <div className="bg-white/80 backdrop-blur-md border-b border-[#E6E9F2] p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-[#1F2A44]">{`تقييم: ${currentTeam?.name}`}</h1>
            <p className="text-[#9AA3B2] text-sm">{currentTeam?.projectName}</p>
          </div>
          <Badge className="bg-[#6C4AB6]/10 text-[#6C4AB6] border-[#6C4AB6]/20">
            {`المرحلة ${currentStage + 1} من ${evaluationStages.length}`}
          </Badge>
        </div>
      </div>

      <div className="h-96 relative">
        <Canvas camera={{ position: [0, 5, 8], fov: 60 }}>
          <Suspense fallback={null}>
            <Environment preset="sunset" />
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <StageEnvironment stage={currentStageData} />
            <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.5} />
          </Suspense>
        </Canvas>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <Card className="bg-white/90 backdrop-blur-sm border-[#E6E9F2] mb-6">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full" style={{ backgroundColor: `${currentStageData.color}20` }}>
                  <currentStageData.icon className="w-8 h-8" style={{ color: currentStageData.color }} />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-[#1F2A44] mb-2">{currentStageData.title}</h2>
              <p className="text-[#9AA3B2] mb-4">{currentStageData.description}</p>
              <Badge
                className="text-sm"
                style={{
                  backgroundColor: `${currentStageData.color}20`,
                  color: currentStageData.color,
                  border: `1px solid ${currentStageData.color}30`,
                }}
              >
                {`الوزن: ${currentStageData.weight}%`}
              </Badge>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-[#1F2A44] mb-4">{"قيّم هذا المعيار"}</h3>
                <StarRating
                  rating={ratings[currentStageData.id] || 0}
                  onRate={(rating) => handleRating(currentStageData.id, rating)}
                  color={currentStageData.color}
                />
                <div className="mt-4">
                  {ratings[currentStageData.id] > 0 && (
                    <p className="text-[#9AA3B2]">
                      {`التقييم: ${ratings[currentStageData.id]}/5 - ${
                        ["ضعيف جداً", "ضعيف", "متوسط", "جيد", "ممتاز"][ratings[currentStageData.id] - 1]
                      }`}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F2A44] mb-2">{"ملاحظات (اختياري)"}</label>
                <textarea
                  value={comments[currentStageData.id] || ""}
                  onChange={(e) => setComments((prev) => ({ ...prev, [currentStageData.id]: e.target.value }))}
                  className="w-full p-3 bg-[#F6F4FB] border border-[#E6E9F2] rounded-lg focus:border-[#6C4AB6] focus:ring-[#6C4AB6]/20 text-[#1F2A44] placeholder:text-[#9AA3B2]"
                  placeholder="أضف ملاحظاتك حول هذا المعيار..."
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center">
          <Button
            onClick={handlePrev}
            disabled={currentStage === 0}
            variant="outline"
            className="border-[#E6E9F2] text-[#1F2A44] hover:bg-[#F6F4FB] disabled:opacity-50 bg-transparent"
          >
            <ChevronRight className="w-4 h-4 ml-2" />
            {"السابق"}
          </Button>

          <div className="flex gap-2">
            {evaluationStages.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index < currentStage
                    ? "bg-green-400"
                    : index === currentStage
                      ? "bg-[#6C4AB6] animate-pulse"
                      : "bg-[#E6E9F2]"
                }`}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            disabled={!canGoNext}
            className="bg-gradient-to-r from-[#6C4AB6] to-[#6FA8FF] hover:from-[#5b3fa0] hover:to-[#5a96e8] text-white disabled:opacity-50"
          >
            {isLastStage ? (
              <>
                {"إنهاء التقييم"}
                <CheckCircle className="w-4 h-4 mr-2" />
              </>
            ) : (
              <>
                {"التالي"}
                <ChevronLeft className="w-4 h-4 mr-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
