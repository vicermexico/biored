'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

interface Props {
  usuario_id: string
  onCerrar: () => void
}

const ITEM_H = 100
const VISIBLE = 3
const COL_W = 80

export default function TragamonedasModal({ usuario_id, onCerrar }: Props) {
  const [productos, setProductos] = useState<HTMLImageElement[]>([])
  const [productosUrls, setProductosUrls] = useState<string[]>([])
  const [jugado, setJugado] = useState(false)
  const [gano, setGano] = useState<boolean | null>(null)
  const [tokensGanados, setTokensGanados] = useState(0)
  const [reclamando, setReclamando] = useState(false)
  const [reclamado, setReclamado] = useState(false)
  const [confeti, setConfeti] = useState(false)
  const [jalando, setJalando] = useState(false)
  const [girando, setGirando] = useState(false)
  const [listo, setListo] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const confetiRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<number>(0)
  const colsRef = useRef([
    { y: 0, vel: 0, detenida: false, imgFinal: 0 },
    { y: 0, vel: 0, detenida: false, imgFinal: 0 },
    { y: 0, vel: 0, detenida: false, imgFinal: 0 },
  ])
  const imgsCargadasRef = useRef<HTMLImageElement[]>([])
  const resultadoRef = useRef<{ gano: boolean, tokens: number } | null>(null)

  useEffect(() => {
    fetch('/api/productos/biored').then(r => r.json()).then(async data => {
      const fotos: string[] = data.filter((p: any) => p.foto_url).map((p: any) => p.foto_url)
      if (fotos.length === 0) return
      setProductosUrls(fotos)
      const imgs = await Promise.all(fotos.map(url => new Promise<HTMLImageElement>(res => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => res(img)
        img.onerror = () => res(img)
        img.src = url
      })))
      imgsCargadasRef.current = imgs
      setProductos(imgs)
      setListo(true)
    })
  }, [])

  const playTick = () => {
    try {
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.type = 'square'
      osc.frequency.value = 300
      gain.gain.setValueAtTime(0.1, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)
      osc.start(); osc.stop(ctx.currentTime + 0.05)
    } catch {}
  }

  const playStop = () => {
    try {
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = 150
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)
      osc.start(); osc.stop(ctx.currentTime + 0.2)
    } catch {}
  }

  const playWin = () => {
    try {
      const ctx = new AudioContext()
      ;[523, 659, 784, 1047].forEach((f, i) => {
        const o = ctx.createOscillator()
        const g = ctx.createGain()
        o.connect(g); g.connect(ctx.destination)
        o.frequency.value = f
        g.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.12)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.25)
        o.start(ctx.currentTime + i * 0.12)
        o.stop(ctx.currentTime + i * 0.12 + 0.25)
      })
    } catch {}
  }

  const dibujar = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const imgs = imgsCargadasRef.current
    if (imgs.length === 0) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    colsRef.current.forEach((col, ci) => {
      const x = ci * (COL_W + 8)
      ctx.save()
      ctx.beginPath()
      ctx.rect(x, 0, COL_W, ITEM_H * VISIBLE)
      ctx.clip()

      const total = imgs.length
      const offset = ((col.y % (total * ITEM_H)) + total * ITEM_H) % (total * ITEM_H)

      for (let i = -1; i < VISIBLE + 2; i++) {
        const idx = ((Math.floor(offset / ITEM_H) + i) % total + total) % total
        const yPos = i * ITEM_H - (offset % ITEM_H)
        if (imgs[idx] && imgs[idx].complete) {
          ctx.drawImage(imgs[idx], x, yPos, COL_W, ITEM_H)
        } else {
          ctx.fillStyle = '#374151'
          ctx.fillRect(x + 2, yPos + 2, COL_W - 4, ITEM_H - 4)
        }
        ctx.strokeStyle = '#4b5563'
        ctx.strokeRect(x, yPos, COL_W, ITEM_H)
      }
      ctx.restore()
    })

    ctx.strokeStyle = '#fbbf24'
    ctx.lineWidth = 3
    const midY = ITEM_H * VISIBLE / 2
    ctx.beginPath()
    ctx.moveTo(0, midY - ITEM_H / 2)
    ctx.lineTo(canvas.width, midY - ITEM_H / 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, midY + ITEM_H / 2)
    ctx.lineTo(canvas.width, midY + ITEM_H / 2)
    ctx.stroke()
  }, [])

  const animar = useCallback(() => {
    const imgs = imgsCargadasRef.current
    if (imgs.length === 0) return

    let prevTick = [0, 0, 0]
    let detenidas = 0

    const loop = () => {
      colsRef.current.forEach((col, i) => {
        if (col.detenida) return
        col.y += col.vel

        const tickActual = Math.floor(col.y / ITEM_H)
        if (tickActual !== prevTick[i]) {
          prevTick[i] = tickActual
          if (col.vel > 2) playTick()
        }

        if (col.vel > 0.5) col.vel *= 0.985
        else if (col.vel > 0) {
          col.y = Math.round(col.y / ITEM_H) * ITEM_H
          col.vel = 0
          col.detenida = true
          detenidas++
          playStop()

          if (detenidas === 3 && resultadoRef.current) {
            setGirando(false)
            setJugado(true)
            if (resultadoRef.current.gano) {
              setGano(true)
              setTokensGanados(resultadoRef.current.tokens)
              setTimeout(playWin, 200)
            } else {
              setGano(false)
            }
          }
        }
      })

      dibujar()
      if (colsRef.current.some(c => !c.detenida)) {
        frameRef.current = requestAnimationFrame(loop)
      }
    }

    frameRef.current = requestAnimationFrame(loop)
  }, [dibujar])

  const handleJalar = async () => {
    if (girando || jugado || !listo) return
    setJalando(true)

    setTimeout(async () => {
      setJalando(false)
      setGirando(true)

      const res = await fetch('/api/tragamonedas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id })
      })
      const data = await res.json()

      if (data.error) {
        setGirando(false)
        setJugado(true)
        setGano(false)
        return
      }

      resultadoRef.current = { gano: data.gano, tokens: data.tokens_ganados }

      const imgs = imgsCargadasRef.current
      const getRandIdx = () => Math.floor(Math.random() * imgs.length)

      let idx0 = getRandIdx()
      let idx1 = data.gano ? idx0 : (() => { let i; do { i = getRandIdx() } while (i === idx0); return i })()
      let idx2 = data.gano ? idx0 : getRandIdx()

      colsRef.current = [
        { y: 0, vel: 25, detenida: false, imgFinal: idx0 },
        { y: 0, vel: 28, detenida: false, imgFinal: idx1 },
        { y: 0, vel: 31, detenida: false, imgFinal: idx2 },
      ]

      const targetTicks = [30, 40, 50]
      setTimeout(() => {
        colsRef.current[0].vel = colsRef.current[0].vel * 0.3
      }, targetTicks[0] * 80)
      setTimeout(() => {
        colsRef.current[1].vel = colsRef.current[1].vel * 0.3
      }, targetTicks[1] * 80)
      setTimeout(() => {
        colsRef.current[2].vel = colsRef.current[2].vel * 0.3
      }, targetTicks[2] * 80)

      animar()
    }, 400)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !listo) return
    canvas.width = 3 * COL_W + 2 * 8
    canvas.height = ITEM_H * VISIBLE
    dibujar()
  }, [listo, dibujar])

  useEffect(() => {
    if (!confeti) return
    const canvas = confetiRef.current
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
        w: Math.random() * 10 + 5, h: Math.random() * 6 + 3,
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
        p.y += p.speed; p.angle += p.spin
        if (p.y < canvas.height + 20) alive = true
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle)
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

  const handleReclamar = async () => {
    setReclamando(true)
    setConfeti(true)
    const u = localStorage.getItem('usuario')
    if (u) {
      const usr = JSON.parse(u)
      fetch('/api/tokens/saldo?usuario_id=' + usr.id).then(r => r.json()).then(d => {
        window.dispatchEvent(new CustomEvent('biored:tokens-changed', { detail: { saldo: d.saldo || 0 } }))
      })
    }
    setTimeout(() => { setReclamado(true); setTimeout(() => onCerrar(), 1500) }, 2000)
  }

  return (
    <>
      {confeti && <canvas ref={confetiRef} style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none' }} />}

      <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
        <div className="bg-gray-900 rounded-3xl w-full overflow-hidden flex flex-col items-center gap-4" style={{ maxWidth: 380, padding: '1.5rem' }}>

          <h1 className="text-xl font-bold text-yellow-400">🎰 TRAGAMONEDAS</h1>

          <div className="flex items-center gap-4">
            <div className="bg-gray-800 rounded-2xl p-2 border-4 border-yellow-500" style={{ position: 'relative' }}>
              <canvas ref={canvasRef} style={{ display: 'block', borderRadius: 8 }} />
            </div>

            <div
              onClick={handleJalar}
              style={{ cursor: girando || jugado ? 'not-allowed' : 'pointer', userSelect: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <div style={{
                width: 14,
                height: jalando ? 110 : 60,
                backgroundColor: '#9ca3af',
                borderRadius: 8,
                transition: 'height 0.3s cubic-bezier(0.4,0,0.2,1)',
                margin: '0 auto',
                boxShadow: '2px 2px 8px rgba(0,0,0,0.6)'
              }} />
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: jalando ? '#b91c1c' : 'radial-gradient(circle at 35% 35%, #f87171, #ef4444, #b91c1c)',
                border: '3px solid #fef08a',
                marginTop: 6,
                transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                transform: jalando ? 'translateY(20px) scale(0.88)' : 'translateY(0) scale(1)',
                boxShadow: '0 4px 15px rgba(239,68,68,0.6)',
              }} />
              {!jugado && <p className="text-yellow-400 text-center mt-2" style={{ fontSize: 10 }}>{girando ? '...' : 'Jalar'}</p>}
            </div>
          </div>

          {jugado && gano === true && !reclamado && (
            <div className="flex flex-col items-center gap-3 w-full">
              <p className="text-2xl font-bold text-yellow-400 text-center">GANASTE {tokensGanados} tokens!</p>
              <button onClick={handleReclamar} disabled={reclamando} className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold py-4 rounded-2xl text-lg">
                {reclamando ? 'Reclamando...' : 'Reclamar mis tokens!'}
              </button>
            </div>
          )}
          {jugado && gano === false && (
            <div className="flex flex-col items-center gap-3 w-full">
              <p className="text-gray-400 text-sm text-center">No ganaste esta vez.</p>
              <button onClick={onCerrar} className="w-full bg-gray-700 text-white font-bold py-3 rounded-2xl">Cerrar</button>
            </div>
          )}
          {reclamado && <p className="text-center text-green-400 font-bold">Token acreditado!</p>}
        </div>
      </div>
    </>
  )
}