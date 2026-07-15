'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

interface Props {
  usuario_id: string
  onCerrar: () => void
}

const ITEM_H = 100
const VISIBLE = 3
const COL_W = 90

function quitarFondoBlanco(img: HTMLImageElement): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = img.naturalWidth || img.width
  c.height = img.naturalHeight || img.height
  const ctx = c.getContext('2d')!
  ctx.drawImage(img, 0, 0)
  const data = ctx.getImageData(0, 0, c.width, c.height)
  for (let i = 0; i < data.data.length; i += 4) {
    const r = data.data[i], g = data.data[i+1], b = data.data[i+2]
    if (r > 230 && g > 230 && b > 230) data.data[i+3] = 0
  }
  ctx.putImageData(data, 0, 0)
  return c
}

export default function TragamonedasModal({ usuario_id, onCerrar }: Props) {
  const [listo, setListo] = useState(false)
  const [tiradas, setTiradas] = useState(1)
  const [tiradaActual, setTiradaActual] = useState(0)
  const [tiradaOficial, setTiradaOficial] = useState(-1)
  const [girando, setGirando] = useState(false)
  const [fase, setFase] = useState<'esperando' | 'girando' | 'resultado' | 'fin'>('esperando')
  const [gano, setGano] = useState(false)
  const [tokensGanados, setTokensGanados] = useState(0)
  const [reclamando, setReclamando] = useState(false)
  const [reclamado, setReclamado] = useState(false)
  const [confeti, setConfeti] = useState(false)
  const [jalando, setJalando] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const confetiRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<number>(0)
  const imgsRef = useRef<HTMLCanvasElement[]>([])
  const colsRef = useRef([
    { y: 0, vel: 0, detenida: false },
    { y: 0, vel: 0, detenida: false },
    { y: 0, vel: 0, detenida: false },
  ])
  const resultadoRef = useRef<{ gano: boolean, tokens: number } | null>(null)
  const tickTimerRef = useRef<number>(0)

  useEffect(() => {
    fetch('/api/tragamonedas').then(r => r.json()).then(cfg => {
      const t = cfg.tiradas_por_evento || 1
      setTiradas(t)
      setTiradaOficial(Math.floor(Math.random() * t))
    })

    fetch('/api/productos/biored').then(r => r.json()).then(async data => {
      const fotos: string[] = data.filter((p: any) => p.foto_url).map((p: any) => p.foto_url)
      if (fotos.length === 0) return
      const imgs = await Promise.all(fotos.map(url => new Promise<HTMLCanvasElement>(res => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => res(quitarFondoBlanco(img))
        img.onerror = () => { const c = document.createElement('canvas'); c.width = 100; c.height = 100; res(c) }
        img.src = url
      })))
      imgsRef.current = imgs
      setListo(true)
    })
  }, [])

  const playTick = useCallback(() => {
    const now = Date.now()
    if (now - tickTimerRef.current < 80) return
    tickTimerRef.current = now
    try {
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.type = 'square'; osc.frequency.value = 400
      gain.gain.setValueAtTime(0.08, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04)
      osc.start(); osc.stop(ctx.currentTime + 0.04)
    } catch {}
  }, [])

  const playStop = useCallback(() => {
    try {
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.type = 'sine'; osc.frequency.value = 180
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
      osc.start(); osc.stop(ctx.currentTime + 0.25)
    } catch {}
  }, [])

  const playWin = useCallback(() => {
    try {
      const ctx = new AudioContext()
      ;[523, 659, 784, 1047].forEach((f, i) => {
        const o = ctx.createOscillator(); const g = ctx.createGain()
        o.connect(g); g.connect(ctx.destination)
        o.frequency.value = f
        g.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.12)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.25)
        o.start(ctx.currentTime + i * 0.12); o.stop(ctx.currentTime + i * 0.12 + 0.25)
      })
    } catch {}
  }, [])

  const dibujar = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const imgs = imgsRef.current
    if (imgs.length === 0) return

    ctx.fillStyle = '#111827'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    colsRef.current.forEach((col, ci) => {
      const x = ci * (COL_W + 6)
      ctx.save()
      ctx.beginPath()
      ctx.rect(x, 0, COL_W, ITEM_H * VISIBLE)
      ctx.clip()

      const total = imgs.length
      const offset = ((col.y % (total * ITEM_H)) + total * ITEM_H) % (total * ITEM_H)

      for (let i = -1; i < VISIBLE + 2; i++) {
        const idx = ((Math.floor(offset / ITEM_H) + i) % total + total) % total
        const yPos = i * ITEM_H - (offset % ITEM_H)
        ctx.fillStyle = '#1f2937'
        ctx.fillRect(x, yPos, COL_W, ITEM_H)
        if (imgs[idx]) {
          ctx.drawImage(imgs[idx], x + 5, yPos + 5, COL_W - 10, ITEM_H - 10)
        }
      }
      ctx.restore()

      ctx.strokeStyle = '#374151'
      ctx.lineWidth = 2
      ctx.strokeRect(x, 0, COL_W, ITEM_H * VISIBLE)
    })

    ctx.strokeStyle = '#fbbf24'
    ctx.lineWidth = 2
    for (let i = 0; i <= VISIBLE; i++) {
      ctx.beginPath()
      ctx.moveTo(0, i * ITEM_H)
      ctx.lineTo(canvas.width, i * ITEM_H)
      ctx.stroke()
    }

    ctx.strokeStyle = '#fbbf24'
    ctx.lineWidth = 3
    const midY = ITEM_H * VISIBLE / 2
    ctx.shadowColor = '#fbbf24'
    ctx.shadowBlur = 6
    ctx.beginPath()
    ctx.moveTo(0, midY - ITEM_H / 2)
    ctx.lineTo(canvas.width, midY - ITEM_H / 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, midY + ITEM_H / 2)
    ctx.lineTo(canvas.width, midY + ITEM_H / 2)
    ctx.stroke()
    ctx.shadowBlur = 0
  }, [])

  const animar = useCallback((onFin: () => void) => {
    let prevTick = [0, 0, 0]
    let detenidas = 0

    const loop = () => {
      colsRef.current.forEach((col, i) => {
        if (col.detenida) return
        col.y += col.vel
        const tickActual = Math.floor(col.y / (ITEM_H / 4))
        if (tickActual !== prevTick[i]) { prevTick[i] = tickActual; playTick() }
        if (col.vel > 0.5) col.vel *= 0.984
        else if (col.vel > 0) {
          col.y = Math.round(col.y / ITEM_H) * ITEM_H
          col.vel = 0; col.detenida = true; detenidas++
          playStop()
          if (detenidas === 3) onFin()
        }
      })
      dibujar()
      if (colsRef.current.some(c => !c.detenida)) frameRef.current = requestAnimationFrame(loop)
    }
    frameRef.current = requestAnimationFrame(loop)
  }, [dibujar, playTick, playStop])

  const getRandIdx = () => Math.floor(Math.random() * imgsRef.current.length)

  const ejecutarTirada = async (esOficial: boolean) => {
    setGirando(true)
    setFase('girando')
    let resultado = { gano: false, tokens: 0 }

    if (esOficial) {
      const res = await fetch('/api/tragamonedas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id, tirada_oficial: true })
      })
      const data = await res.json()
      resultado = { gano: data.gano || false, tokens: data.tokens_ganados || 0 }
    }

    resultadoRef.current = resultado

    colsRef.current = [
      { y: 0, vel: 22, detenida: false },
      { y: 0, vel: 25, detenida: false },
      { y: 0, vel: 28, detenida: false },
    ]

    setTimeout(() => { colsRef.current[0].vel *= 0.3 }, 2000)
    setTimeout(() => { colsRef.current[1].vel *= 0.3 }, 2700)
    setTimeout(() => { colsRef.current[2].vel *= 0.3 }, 3400)

    animar(() => {
      setGirando(false)
      setFase('resultado')
      if (resultado.gano) {
        setGano(true)
        setTokensGanados(resultado.tokens)
        setTimeout(playWin, 300)
        setConfeti(true)
      }
    })
  }

  const handleJalar = async () => {
    if (girando || !listo || fase === 'fin') return
    const idx = tiradaActual
    setTiradaActual(prev => prev + 1)
    setJalando(true)
    setTimeout(() => { setJalando(false); ejecutarTirada(idx === tiradaOficial) }, 400)
  }

  const handleSiguiente = () => {
    if (tiradaActual >= tiradas) { setFase('fin'); return }
    setFase('esperando')
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !listo) return
    canvas.width = 3 * COL_W + 2 * 6
    canvas.height = ITEM_H * VISIBLE
    dibujar()
  }, [listo, dibujar])

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
        <div className="bg-gray-900 rounded-3xl w-full overflow-hidden flex flex-col items-center gap-4" style={{ maxWidth: 360, padding: '1.5rem' }}>

          <div className="flex items-center justify-between w-full">
            <h1 className="text-xl font-bold text-yellow-400">🎰 TRAGAMONEDAS</h1>
            <p className="text-gray-400 text-xs">Tirada {Math.min(tiradaActual + 1, tiradas)} de {tiradas}</p>
          </div>

          <div className="rounded-2xl overflow-hidden border-4 border-yellow-500 w-full">
            <canvas ref={canvasRef} style={{ display: 'block', width: '100%' }} />
          </div>

          {gano && !reclamado && (
            <div className="w-full flex flex-col items-center gap-3">
              <p className="text-2xl font-bold text-yellow-400 text-center">GANASTE {tokensGanados} tokens!</p>
              <button onClick={handleReclamar} disabled={reclamando} className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold py-4 rounded-2xl text-lg">
                {reclamando ? 'Reclamando...' : 'Reclamar mis tokens!'}
              </button>
            </div>
          )}

          {reclamado && <p className="text-center text-green-400 font-bold">Token acreditado!</p>}

          {fase === 'esperando' && !gano && (
            <button onClick={handleJalar} disabled={girando || !listo} className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold py-4 rounded-2xl text-lg" style={{ transform: jalando ? 'scale(0.95)' : 'scale(1)', transition: 'transform 0.2s' }}>
              {listo ? 'COMENZAR' : 'Cargando...'}
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