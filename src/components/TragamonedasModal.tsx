'use client'
import { useState, useEffect, useRef } from 'react'

interface Props {
  usuario_id: string
  onCerrar: () => void
}

export default function TragamonedasModal({ usuario_id, onCerrar }: Props) {
  const [tiradas, setTiradas] = useState(1)
  const [tiradaActual, setTiradaActual] = useState(0)
  const [fase, setFase] = useState<'esperando' | 'reproduciendo' | 'resultado' | 'fin'>('esperando')
  const [gano, setGano] = useState(false)
  const [tokensGanados, setTokensGanados] = useState(0)
  const [videoUrl, setVideoUrl] = useState('')
  const [reclamando, setReclamando] = useState(false)
  const [reclamado, setReclamado] = useState(false)
  const [confeti, setConfeti] = useState(false)
  const [cargando, setCargando] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const confetiRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    fetch('/api/tragamonedas').then(r => r.json()).then(cfg => {
      setTiradas(cfg.tiradas_por_evento || 1)
    })
  }, [])

  useEffect(() => {
    if (!confeti) return
    const canvas = confetiRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = window.innerWidth; canvas.height = window.innerHeight
    const colors = ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6']
    const particles: any[] = []
    for (let i = 0; i < 150; i++) {
      particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height - canvas.height, w: Math.random() * 10 + 5, h: Math.random() * 6 + 3, color: colors[Math.floor(Math.random() * colors.length)], speed: Math.random() * 4 + 2, angle: Math.random() * Math.PI * 2, spin: (Math.random() - 0.5) * 0.2 })
    }
    let frame: number
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let alive = false
      particles.forEach(p => {
        p.y += p.speed; p.angle += p.spin
        if (p.y < canvas.height + 20) alive = true
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle)
        ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore()
      })
      if (alive) frame = requestAnimationFrame(draw)
      else setConfeti(false)
    }
    frame = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frame)
  }, [confeti])

  const cargarVideo = async () => {
    if (cargando) return
    setCargando(true)
    const idx = tiradaActual
    setTiradaActual(prev => prev + 1)
    const esOficial = idx === tiradas - 1
    const res = await fetch('/api/tragamonedas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario_id, tirada_oficial: esOficial })
    })
    const data = await res.json()
    setVideoUrl(data.video_url || '')
    if (data.gano) {
      setGano(true)
      setTokensGanados(data.tokens_ganados || 0)
    }
    setCargando(false)
    setFase('listo')
  }

  const handleJugar = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => handleVideoTerminado())
      setFase('reproduciendo')
    }
  }

  const handleVideoTerminado = () => {
    setFase('resultado')
    if (gano) setConfeti(true)
  }

  const handleSiguiente = () => {
    if (tiradaActual >= tiradas) { setFase('fin'); return }
    setVideoUrl('')
    setGano(false)
    setFase('esperando')
  }

  const handleReclamar = () => {
    setReclamando(true)
    const u = localStorage.getItem('usuario')
    if (u) {
      const usr = JSON.parse(u)
      fetch('/api/tokens/saldo?usuario_id=' + usr.id).then(r => r.json()).then(d => {
        window.dispatchEvent(new CustomEvent('biored:tokens-changed', { detail: { saldo: d.saldo || 0 } }))
      })
    }
    setTimeout(() => { setReclamado(true); setTimeout(() => onCerrar(), 1500) }, 1500)
  }

  return (
    <>
      {confeti && <canvas ref={confetiRef} style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none' }} />}

      <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
        <div className="bg-gray-900 rounded-3xl w-full overflow-hidden flex flex-col items-center gap-4" style={{ maxWidth: 380, padding: '1.5rem' }}>

          <div className="flex items-center justify-between w-full">
            <h1 className="text-xl font-bold text-yellow-400">Tragamonedas</h1>
            <p className="text-gray-400 text-xs">Tirada {Math.min(tiradaActual + (fase === 'esperando' ? 1 : 0), tiradas)} de {tiradas}</p>
          </div>

          {(fase === 'listo' || fase === 'reproduciendo' || fase === 'resultado') && videoUrl && (
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full rounded-2xl"
              style={{ maxHeight: '55vh', pointerEvents: 'none' }}
              playsInline
              disablePictureInPicture
              onEnded={handleVideoTerminado}
            />
          )}

          {fase === 'resultado' && gano && !reclamado && (
            <div className="w-full flex flex-col items-center gap-3">
              <p className="text-3xl font-bold text-yellow-400 text-center">GANASTE {tokensGanados} tokens!</p>
              <button onClick={handleReclamar} disabled={reclamando} className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold py-4 rounded-2xl text-lg">
                {reclamando ? 'Reclamando...' : 'Reclamar mis tokens!'}
              </button>
            </div>
          )}

          {reclamado && <p className="text-center text-green-400 font-bold text-lg">Token acreditado!</p>}

          {fase === 'esperando' && (
            <button onClick={cargarVideo} disabled={cargando} className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold py-5 rounded-2xl text-xl">
              {cargando ? 'Cargando...' : 'JUGAR'}
            </button>
          )}

          {fase === 'listo' && (
            <button onClick={handleJugar} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-5 rounded-2xl text-xl">
              JUGAR
            </button>
          )}

          {fase === 'resultado' && !gano && tiradaActual < tiradas && (
            <button onClick={handleSiguiente} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 rounded-2xl text-lg">
              Siguiente tirada →
            </button>
          )}

          {fase === 'resultado' && !gano && tiradaActual >= tiradas && (
            <button onClick={() => setFase('fin')} className="w-full bg-gray-700 text-white font-bold py-3 rounded-2xl">
              Ver resultado final
            </button>
          )}

          {fase === 'fin' && !gano && (
            <div className="fixed inset-0 z-60 flex items-center justify-center px-6" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
              <div className="bg-gray-900 rounded-3xl p-8 flex flex-col items-center gap-4 text-center w-full" style={{ maxWidth: 320 }}>
                <p className="text-5xl">😔</p>
                <p className="text-2xl font-bold text-white">No ganaste esta vez</p>
                <p className="text-gray-400 text-sm">Sigue participando, la suerte cambia</p>
                <button onClick={onCerrar} className="w-full bg-red-500 text-white font-bold px-8 py-4 rounded-2xl text-lg mt-2">Seguir</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}