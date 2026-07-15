'use client'
import { useRef, useState, useEffect } from 'react'

type Fase = 'inicio' | 'reproduciendo' | 'terminado' | 'reclamado'

interface Props {
  video_url: string
  tokens: number
  tipo: string
  usuario_id: string
  onCerrar: () => void
}

export default function JuegoModal({ video_url, tokens, tipo, usuario_id, onCerrar }: Props) {
  const [fase, setFase] = useState<Fase>('inicio')
  const [cargando, setCargando] = useState(false)
  const [confeti, setConfeti] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleJugar = () => {
    setFase('reproduciendo')
    setTimeout(() => videoRef.current?.play(), 50)
  }

  const handleReclamar = async () => {
    if (cargando || fase === 'reclamado') return
    setCargando(true)
    try {
      const res = await fetch('/api/juego/reclamar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id, tipo }),
      })
      const data = await res.json()
      if (data.nuevoSaldo !== undefined) {
        window.dispatchEvent(new CustomEvent('biored:tokens-changed', { detail: { saldo: data.nuevoSaldo } }))
      }
      setFase('reclamado')
      setConfeti(true)
      setTimeout(() => onCerrar(), 2500)
    } catch {
      setCargando(false)
    }
  }

  useEffect(() => {
    if (!confeti) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const colors = ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6']
    const particles: any[] = []
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        w: Math.random() * 10 + 5,
        h: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 4 + 2,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.2,
      })
    }
    let frame: number
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let alive = false
      particles.forEach(p => {
        p.y += p.speed
        p.angle += p.spin
        if (p.y < canvas.height + 20) alive = true
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.angle)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      })
      if (alive) frame = requestAnimationFrame(draw)
      else setConfeti(false)
    }
    frame = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frame)
  }, [confeti])

  return (
    <>
      {confeti && (
        <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none' }} />
      )}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
        <div className="bg-gray-900 rounded-3xl w-full flex flex-col items-center gap-4 overflow-hidden" style={{ maxWidth: 480, minHeight: '80vh', justifyContent: 'center', padding: '2rem' }}>
          {fase === 'inicio' && (
            <>
              <p className="text-6xl">🎮</p>
              <h1 className="text-3xl font-bold text-white text-center">FELICIDADES!</h1>
              <p className="text-gray-300 text-base text-center">Has ganado un juego GRATIS</p>
              <button onClick={handleJugar} className="bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-5 rounded-2xl text-xl w-full mt-4">
                JUGAR
              </button>
            </>
          )}
          {(fase === 'reproduciendo' || fase === 'terminado') && (
            <>
              <video
                ref={videoRef}
                src={video_url}
                className="w-full rounded-2xl object-cover"
                style={{ maxHeight: '60vh' }}
                playsInline
                disablePictureInPicture
                onEnded={() => setFase('terminado')}
              />
              {fase === 'terminado' && (
                <button
                  onClick={handleReclamar}
                  disabled={cargando}
                  className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold px-8 py-5 rounded-2xl text-xl w-full"
                >
                  {cargando ? 'Reclamando...' : 'Reclamar mis tokens!'}
                </button>
              )}
            </>
          )}
          {fase === 'reclamado' && (
            <div className="flex flex-col items-center gap-4">
              <p className="text-6xl">🎉</p>
              <h2 className="text-2xl font-bold text-white text-center">Token reclamado!</h2>
            </div>
          )}
        </div>
      </div>
    </>
  )
}