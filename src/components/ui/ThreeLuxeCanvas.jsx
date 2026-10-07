import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * ThreeLuxeCanvas
 * 3D WebGL Particle & Constellation Canvas for ShaadiOS Luxe Hero
 * Built with Three.js & inspired by ThreeUI
 */
export function ThreeLuxeCanvas({
  theme = 'gold-rose', // 'gold-rose' | 'velvet-night'
  interactive = true,
  className = '',
}) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let animationFrameId
    const width = container.clientWidth || window.innerWidth
    const height = container.clientHeight || 600

    // Scene, Camera, Renderer
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
    camera.position.z = 180

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    // Particle Data (Royal Indian Wedding palette: Gold & Rose Champagne)
    const particleCount = 110
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const velocities = []

    const goldColor = new THREE.Color(0xd4af37)
    const roseColor = new THREE.Color(0xbe254a)
    const amberColor = new THREE.Color(0xf59e0b)

    for (let i = 0; i < particleCount; i++) {
      // Position
      positions[i * 3] = (Math.random() - 0.5) * 280
      positions[i * 3 + 1] = (Math.random() - 0.5) * 180
      positions[i * 3 + 2] = (Math.random() - 0.5) * 120

      // Velocity
      velocities.push({
        x: (Math.random() - 0.5) * 0.25,
        y: (Math.random() - 0.5) * 0.25,
        z: (Math.random() - 0.5) * 0.15,
      })

      // Color distribution (70% gold, 30% rose)
      const chosenColor = Math.random() > 0.3 ? goldColor : (Math.random() > 0.5 ? roseColor : amberColor)
      colors[i * 3] = chosenColor.r
      colors[i * 3 + 1] = chosenColor.g
      colors[i * 3 + 2] = chosenColor.b
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    // High quality circle particle texture
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const ctx = canvas.getContext('2d')
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
    gradient.addColorStop(0, 'rgba(255,255,255,1)')
    gradient.addColorStop(0.3, 'rgba(255,235,170,0.85)')
    gradient.addColorStop(1, 'rgba(255,235,170,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 32, 32)

    const particleTexture = new THREE.CanvasTexture(canvas)

    const material = new THREE.PointsMaterial({
      size: 4.8,
      vertexColors: true,
      map: particleTexture,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const pointCloud = new THREE.Points(geometry, material)
    scene.add(pointCloud)

    // Lines geometry for constellation connections
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xe5c07b,
      transparent: true,
      opacity: 0.14,
      blending: THREE.AdditiveBlending,
    })

    const lineGeometry = new THREE.BufferGeometry()
    const maxLineSegments = particleCount * 6
    const linePositions = new Float32Array(maxLineSegments * 6)
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))
    const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial)
    scene.add(lineSegments)

    // Mouse Interaction
    let mouseX = 0
    let mouseY = 0
    let targetX = 0
    let targetY = 0

    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      targetX = (x - 0.5) * 35
      targetY = (y - 0.5) * -25
    }

    if (interactive) {
      window.addEventListener('pointermove', handlePointerMove)
    }

    // Animation loop
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      // Smooth camera sway
      mouseX += (targetX - mouseX) * 0.05
      mouseY += (targetY - mouseY) * 0.05
      camera.position.x = mouseX
      camera.position.y = mouseY
      camera.lookAt(scene.position)

      const pos = geometry.attributes.position.array
      let lineIndex = 0
      const maxDistance = 42

      for (let i = 0; i < particleCount; i++) {
        // Update positions
        pos[i * 3] += velocities[i].x
        pos[i * 3 + 1] += velocities[i].y
        pos[i * 3 + 2] += velocities[i].z

        // Bounce back into bounds
        if (pos[i * 3] < -140 || pos[i * 3] > 140) velocities[i].x *= -1
        if (pos[i * 3 + 1] < -90 || pos[i * 3 + 1] > 90) velocities[i].y *= -1
        if (pos[i * 3 + 2] < -60 || pos[i * 3 + 2] > 60) velocities[i].z *= -1

        // Connect nearby nodes
        for (let j = i + 1; j < particleCount; j++) {
          const dx = pos[i * 3] - pos[j * 3]
          const dy = pos[i * 3 + 1] - pos[j * 3 + 1]
          const dz = pos[i * 3 + 2] - pos[j * 3 + 2]
          const distSq = dx * dx + dy * dy + dz * dz

          if (distSq < maxDistance * maxDistance && lineIndex < maxLineSegments * 6 - 6) {
            linePositions[lineIndex++] = pos[i * 3]
            linePositions[lineIndex++] = pos[i * 3 + 1]
            linePositions[lineIndex++] = pos[i * 3 + 2]

            linePositions[lineIndex++] = pos[j * 3]
            linePositions[lineIndex++] = pos[j * 3 + 1]
            linePositions[lineIndex++] = pos[j * 3 + 2]
          }
        }
      }

      geometry.attributes.position.needsUpdate = true

      // Update line segments
      lineGeometry.setDrawRange(0, lineIndex / 3)
      lineGeometry.attributes.position.needsUpdate = true

      pointCloud.rotation.y += 0.0008
      lineSegments.rotation.y += 0.0008

      renderer.render(scene, camera)
    }

    animate()

    // Resize handler
    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(container)

    return () => {
      cancelAnimationFrame(animationFrameId)
      if (interactive) {
        window.removeEventListener('pointermove', handlePointerMove)
      }
      resizeObserver.disconnect()
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement)
      }
      geometry.dispose()
      material.dispose()
      lineGeometry.dispose()
      lineMaterial.dispose()
      particleTexture.dispose()
      renderer.dispose()
    }
  }, [interactive, theme])

  return (
    <div
      ref={containerRef}
      className={`three-canvas-container ${className}`}
      aria-hidden="true"
    />
  )
}

export default ThreeLuxeCanvas
