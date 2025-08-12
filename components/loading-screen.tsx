"use client"

import { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, Float, Text3D, Center } from "@react-three/drei"

function LoadingAnimation() {
  return (
    <>
      <Environment preset="sunset" />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Center>
          <Text3D font="/fonts/Geist-Bold.ttf" size={1.5} height={0.2} curveSegments={12} position={[0, 1, 0]}>
            LOADING
            <meshStandardMaterial color="#6C4AB6" />
          </Text3D>
        </Center>
      </Float>

      {[...Array(8)].map((_, i) => (
        <Float key={i} speed={1 + i * 0.2} rotationIntensity={0.3}>
          <mesh position={[Math.cos((i * Math.PI) / 4) * 4, Math.sin(i * 0.5) * 2, Math.sin((i * Math.PI) / 4) * 4]}>
            <sphereGeometry args={[0.3]} />
            <meshStandardMaterial color="#6FA8FF" emissive="#6FA8FF" emissiveIntensity={0.3} />
          </mesh>
        </Float>
      ))}
    </>
  )
}

export default function LoadingScreen() {
  const loadingText = "جاري التحميل..."
  const preparingText = "تحضير نظام التقييم الاحترافي"

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F4FB] to-[#E6E9F2] flex items-center justify-center">
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
          <Suspense fallback={null}>
            <LoadingAnimation />
            <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={2} />
          </Suspense>
        </Canvas>
      </div>

      <div className="relative z-10 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#6C4AB6] mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-[#1F2A44] mb-2">{loadingText}</h2>
        <p className="text-[#9AA3B2]">{preparingText}</p>
      </div>
    </div>
  )
}
