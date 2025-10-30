'use client'

import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  fill?: boolean
  sizes?: string
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  loading?: 'lazy' | 'eager'
  onLoad?: () => void
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 75,
  fill = false,
  sizes,
  objectFit = 'cover',
  loading = 'lazy',
  onLoad
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setError(true)
    setIsLoading(false)
  }

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-200 dark:bg-gray-700 ${className}`}
        style={{ width, height }}
      >
        <svg 
          className="w-12 h-12 text-gray-400"
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
      )}
      <Image
        src={src}
        alt={alt}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        fill={fill}
        sizes={sizes}
        quality={quality}
        priority={priority}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${objectFit === 'cover' ? 'object-cover' : ''} ${
          objectFit === 'contain' ? 'object-contain' : ''
        }`}
      />
    </div>
  )
}

// Lazy load component wrapper
interface LazyLoadProps {
  children: React.ReactNode
  className?: string
  threshold?: number
  rootMargin?: string
}

export function LazyLoad({
  children,
  className = '',
  threshold = 0.1,
  rootMargin = '50px'
}: LazyLoadProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [ref, setRef] = useState<HTMLDivElement | null>(null)

  useState(() => {
    if (!ref) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(ref)

    return () => observer.disconnect()
  })

  return (
    <div ref={setRef} className={className}>
      {isVisible ? children : <div className="min-h-[200px] bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />}
    </div>
  )
}
