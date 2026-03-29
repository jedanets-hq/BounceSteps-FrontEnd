"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import createGlobe from "cobe"

interface Marker {
  id: string
  location: [number, number]
  label: string
}

interface Arc {
  id: string
  from: [number, number]
  to: [number, number]
  label?: string
}

interface GlobeProps {
  markers?: Marker[]
  arcs?: Arc[]
  className?: string
  markerColor?: [number, number, number]
  baseColor?: [number, number, number]
  arcColor?: [number, number, number]
  glowColor?: [number, number, number]
  dark?: number
  mapBrightness?: number
  markerSize?: number
  markerElevation?: number
  arcWidth?: number
  arcHeight?: number
  speed?: number
  theta?: number
  diffuse?: number
  mapSamples?: number
}

export function Globe({
  markers = [],
  arcs = [],
  className = "",
  markerColor = [0.1, 0.4, 0.2], // Adjust to primary green colors
  baseColor = [1, 1, 1],
  arcColor = [0.1, 0.4, 0.2],
  glowColor = [0.1, 0.4, 0.2],
  dark = 0,
  mapBrightness = 6,
  markerSize = 0.03,
  markerElevation = 0.02,
  arcWidth = 0.5,
  arcHeight = 0.25,
  speed = 0.003,
  theta = 0.2,
  diffuse = 1.5,
  mapSamples = 16000,
}: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const pointerInteracting = useRef<{ x: number; y: number } | null>(null)
  const lastPointer = useRef<{ x: number; y: number; t: number } | null>(null)
  const dragOffset = useRef({ phi: 0, theta: 0 })
  const velocity = useRef({ phi: 0, theta: 0 })
  const phiOffsetRef = useRef(0)
  const thetaOffsetRef = useRef(0)
  const isPausedRef = useRef(false)

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (isMobile) return
      pointerInteracting.current = { x: e.clientX, y: e.clientY }
      if (canvasRef.current) canvasRef.current.style.cursor = "grabbing"
      isPausedRef.current = true
    },
    [isMobile]
  )

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (pointerInteracting.current !== null) {
      const deltaX = e.clientX - pointerInteracting.current.x
      const deltaY = e.clientY - pointerInteracting.current.y
      dragOffset.current = { phi: deltaX / 300, theta: deltaY / 1000 }
      const now = Date.now()
      if (lastPointer.current) {
        const dt = Math.max(now - lastPointer.current.t, 1)
        const maxVelocity = 0.15
        velocity.current = {
          phi: Math.max(
            -maxVelocity,
            Math.min(maxVelocity, ((e.clientX - lastPointer.current.x) / dt) * 0.3)
          ),
          theta: Math.max(
            -maxVelocity,
            Math.min(maxVelocity, ((e.clientY - lastPointer.current.y) / dt) * 0.08)
          ),
        }
      }
      lastPointer.current = { x: e.clientX, y: e.clientY, t: now }
    }
  }, [])

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi
      thetaOffsetRef.current += dragOffset.current.theta
      dragOffset.current = { phi: 0, theta: 0 }
      lastPointer.current = null
    }
    pointerInteracting.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = "grab"
    isPausedRef.current = false
  }, [])

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerup", handlePointerUp, { passive: true })
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [handlePointerMove, handlePointerUp])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    let globe: ReturnType<typeof createGlobe> | null = null
    let animationId: number
    let phi = 0

    function init() {
      const width = canvas.offsetWidth
      if (width === 0 || globe) return

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      globe = createGlobe(canvas, {
        devicePixelRatio: dpr,
        width: width * dpr,
        height: width * dpr,
        phi: 0,
        theta,
        dark,
        diffuse,
        mapSamples: isMobile ? 4000 : mapSamples,
        mapBrightness,
        baseColor,
        markerColor,
        glowColor,
        markerElevation,
        markers: markers.map((m) => ({
          location: m.location as [number, number],
          size: markerSize,
        })),
        arcs: arcs.map((a) => ({
          from: a.from as [number, number],
          to: a.to as [number, number],
        })),
        opacity: 0.8,
      })

      function animate() {
        if (!isMobile) {
          if (!isPausedRef.current) {
            phi += speed
            if (
              Math.abs(velocity.current.phi) > 0.0001 ||
              Math.abs(velocity.current.theta) > 0.0001
            ) {
              phiOffsetRef.current += velocity.current.phi
              thetaOffsetRef.current += velocity.current.theta
              velocity.current.phi *= 0.95
              velocity.current.theta *= 0.95
            }
            const thetaMin = -0.4,
              thetaMax = 0.4
            if (thetaOffsetRef.current < thetaMin) {
              thetaOffsetRef.current += (thetaMin - thetaOffsetRef.current) * 0.1
            } else if (thetaOffsetRef.current > thetaMax) {
              thetaOffsetRef.current += (thetaMax - thetaOffsetRef.current) * 0.1
            }
          }
          globe!.update({
            phi: phi + phiOffsetRef.current + dragOffset.current.phi,
            theta: theta + thetaOffsetRef.current + dragOffset.current.theta,
            markers: markers.map((m) => ({
              location: m.location as [number, number],
              size: markerSize,
            })),
            arcs: arcs.map((a) => ({
              from: a.from as [number, number],
              to: a.to as [number, number],
            })),
          })
          animationId = requestAnimationFrame(animate)
        } else {
          globe!.update({
            phi: 0.5,
            theta: theta,
            markers: markers.map((m) => ({
              location: m.location as [number, number],
              size: markerSize,
            })),
            arcs: arcs.map((a) => ({
              from: a.from as [number, number],
              to: a.to as [number, number],
            })),
          })
        }
      }

      animate()
      setTimeout(() => canvas && (canvas.style.opacity = "1"))
    }

    if (canvas.offsetWidth > 0) {
      init()
    } else {
      const ro = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width > 0) {
          ro.disconnect()
          init()
        }
      })
      ro.observe(canvas)
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      if (globe) globe.destroy()
    }
  }, [markers, arcs, markerColor, baseColor, glowColor, dark, mapBrightness, markerSize, markerElevation, arcWidth, arcHeight, speed, theta, diffuse, mapSamples, isMobile])

  return (
    <div className={`relative aspect-square select-none ${className}`}>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        className="w-full h-full opacity-0 touch-none transition-opacity duration-[1.2s]"
        style={{
          cursor: "grab",
          borderRadius: "50%",
        }}
      />
    </div>
  )
}
