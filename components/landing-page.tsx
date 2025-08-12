"use client"

import { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, Float, Text3D, Center } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Users, Target, Zap, ArrowLeft } from "lucide-react"

interface LandingPageProps {
  onStartEvaluation: () => void
}

function HeroBackground() {
  return (
    <>
      <Environment preset="sunset" />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      <Float speed={1} rotationIntensity={0.3} floatIntensity={0.3}>
        <Center>
          <Text3D font="/fonts/Geist-Bold.ttf" size={2} height={0.3} curveSegments={12} position={[0, 2, 0]}>
            {"هاكاثون"}
            <meshStandardMaterial color="#6C4AB6" />
          </Text3D>
        </Center>
      </Float>

      <Float speed={0.8} rotationIntensity={0.2} floatIntensity={0.2}>
        <Center>
          <Text3D font="/fonts/Geist-Regular.ttf" size={1.2} height={0.2} curveSegments={12} position={[0, 0, 0]}>
            {"التقييم"}
            <meshStandardMaterial color="#6FA8FF" />
          </Text3D>
        </Center>
      </Float>

      {[...Array(15)].map((_, i) => (
        <Float key={i} speed={0.5 + Math.random()} rotationIntensity={0.2} floatIntensity={0.2}>
          <mesh position={[(Math.random() - 0.5) * 25, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 25]}>
            <boxGeometry args={[0.4, 0.4, 0.4]} />
            <meshStandardMaterial color="#6C4AB6" opacity={0.7} transparent />
          </mesh>
        </Float>
      ))}
    </>
  )
}

export default function LandingPage({ onStartEvaluation }: LandingPageProps) {
  const features = [
    {
      icon: <Trophy className="w-8 h-8 text-[#6C4AB6]" />,
      title: "تقييم احترافي",
      description: "نظام تقييم متقدم بمعايير واضحة ومحددة",
    },
    {
      icon: <Users className="w-8 h-8 text-[#6FA8FF]" />,
      title: "إدارة الفرق",
      description: "تنظيم وإدارة فرق الهاكاثون بسهولة",
    },
    {
      icon: <Target className="w-8 h-8 text-[#6C4AB6]" />,
      title: "معايير دقيقة",
      description: "5 معايير أساسية مع أوزان محددة",
    },
    {
      icon: <Zap className="w-8 h-8 text-[#6FA8FF]" />,
      title: "تجربة تفاعلية",
      description: "واجهة ثلاثية الأبعاد تفاعلية",
    },
  ]

  return (
    <div className="min-h-screen bg-[#F6F4FB] relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-30">
        <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
          <Suspense fallback={null}>
            <HeroBackground />
            <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.5} />
          </Suspense>
        </Canvas>
      </div>

      <div className="relative z-10">
        <header className="bg-white/80 backdrop-blur-md border-b border-[#E6E9F2] sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="p-2 rounded-lg bg-[#6C4AB6]/10">
                  <Trophy className="w-6 h-6 text-[#6C4AB6]" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-[#1F2A44]">{"هاكاثون الابتكار"}</h1>
                  <p className="text-sm text-[#9AA3B2]">{"نظام التقييم الاحترافي"}</p>
                </div>
              </div>
              <Badge className="bg-[#6C4AB6]/10 text-[#6C4AB6] border-[#6C4AB6]/20">{"الإصدار 1.0"}</Badge>
            </div>
          </div>
        </header>

        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <Badge className="bg-[#6C4AB6]/10 text-[#6C4AB6] border-[#6C4AB6]/20 mb-4">
                {"منصة التقييم الرسمية"}
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold text-[#1F2A44] mb-6 leading-tight">
                {"نظام تقييم"}
                <span className="text-[#6C4AB6] block">{"هاكاثون الابتكار"}</span>
                <span className="text-[#6FA8FF]">{"الحكومي"}</span>
              </h1>
              <p className="text-xl text-[#9AA3B2] mb-8 max-w-2xl mx-auto leading-relaxed">
                {"منصة احترافية وتفاعلية لتقييم وترتيب فرق الهاكاثون باستخدام معايير دقيقة ونظام تقييم متقدم"}
              </p>
            </div>

            <div className="mb-12">
              <img
                src="/placeholder.svg?height=400&width=600&text=فريق+هاكاثون+يعمل+معاً"
                alt="فريق هاكاثون يعمل معاً"
                className="mx-auto rounded-2xl shadow-2xl border-4 border-white/50"
              />
            </div>

            <Button
              onClick={onStartEvaluation}
              size="lg"
              className="bg-gradient-to-r from-[#6C4AB6] to-[#6FA8FF] hover:from-[#5b3fa0] hover:to-[#5a96e8] text-white px-12 py-6 text-xl rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Trophy className="ml-3 w-6 h-6" />
              {"ابدأ التقييم"}
              <ArrowLeft className="mr-3 w-6 h-6" />
            </Button>

            <p className="text-[#9AA3B2] text-sm mt-4">{"سجّل دخولك وابدأ تقييم الفرق المشاركة"}</p>
          </div>
        </section>

        <section className="py-16 px-4 bg-white/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#1F2A44] mb-4">{"لماذا نظامنا؟"}</h2>
              <p className="text-[#9AA3B2] text-lg max-w-2xl mx-auto">
                {"نوفر تجربة تقييم شاملة ومتقدمة تضمن العدالة والشفافية"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="bg-white/80 backdrop-blur-sm border-[#E6E9F2] hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 rounded-full bg-[#F6F4FB]">{feature.icon}</div>
                    </div>
                    <h3 className="text-lg font-semibold text-[#1F2A44] mb-2">{feature.title}</h3>
                    <p className="text-[#9AA3B2] text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#1F2A44] mb-4">{"معايير التقييم"}</h2>
              <p className="text-[#9AA3B2] text-lg">{"خمسة معايير أساسية لتقييم شامل ومتوازن"}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "التوافق الاستراتيجي", weight: "20%", color: "#6C4AB6" },
                { title: "ابتكارية الفكرة", weight: "25%", color: "#6FA8FF" },
                { title: "قابلية التطبيق", weight: "25%", color: "#8EA7FF" },
                { title: "التأثير على المؤسسة", weight: "20%", color: "#6C4AB6" },
                { title: "مهارات العرض", weight: "10%", color: "#6FA8FF" },
              ].map((criteria, index) => (
                <Card key={index} className="bg-white/80 backdrop-blur-sm border-[#E6E9F2]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: criteria.color }} />
                      <Badge
                        className="text-xs"
                        style={{
                          backgroundColor: `${criteria.color}20`,
                          color: criteria.color,
                          border: `1px solid ${criteria.color}30`,
                        }}
                      >
                        {criteria.weight}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-[#1F2A44] text-sm">{criteria.title}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <footer className="bg-[#1F2A44] text-white py-8 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center items-center mb-4">
              <Trophy className="w-6 h-6 text-[#6FA8FF] ml-2" />
              <span className="font-semibold">{"هاكاثون الابتكار الحكومي"}</span>
            </div>
            <p className="text-[#9AA3B2] text-sm">{"منصة احترافية لتقييم وترتيب فرق الهاكاثون"}</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
