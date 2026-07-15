'use client'
import { useState, useEffect, useRef } from 'react'

interface Props {
  usuario_id: string
  onCerrar: () => void
}

export default function TragamonedasModal({ usuario_id, onCerrar }: Props) {
  const [productos, setProductos] = useState<string[]>([])
  const [columnas, setColumnas] = useState<string[][]>([[''], [''], ['']])
  const [girando, setGirando] = useState(false)
  const [jugado, setJugado] = useState(false)
  const [gano, setGano] = useState<boolean | null>(null)
  const [tokensGanados, setTokensGanados] = useState(0)
  const [reclamando, setReclamando] = useState(false)
  const [reclamado, setReclamado] = useState(false)
  const [confeti, setConfeti] = useState(false)
  const [jalando, setJalando] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const intervalRefs = useRef<any[]>([null, null, null])
  const resultadoRef = useRef<string[]>([])

  useEffect(() => {
    fetch('/api/productos/biored').then(r => r.json()).then(data => {
      const fotos = data.filter((p: any) => p.foto_url).map((p: any) => p.foto_url)
      if (fotos.length > 0) {
        setProductos(fotos)
        setColumnas([[fotos[0]], [fotos[0]], [fotos[0]]])
      }
    })
  }, [])

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

  const getRandom = () => productos[Math.floor(Math.random() * productos.length)]

  const girarColumna = (col: number, imagenFinal: string, giros: number, onDone: () => void) => {
    let contador = 0
    intervalRefs.current[col] = setInterval(() => {
      contador++
      if (contador >= giros) {
        clearInterval(intervalRefs.current[col])
        setColumnas(prev => { const n = [...prev]; n[col] = [imagenFinal]; return n })
        onDone()
      } else {
        setColumnas(prev => { const n = [...prev]; n[col] = [getRandom()]; return n })
      }
    }, 80)
  }

  const handleJalar = async () => {
    if (girando || jugado || productos.length === 0) return
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

      let img1: string, img2: string, img3: string
      if (data.gano) {
        const img = getRandom()
        img1 = img2 = img3 = img
        setTokensGanados(data.tokens_ganados)
      } else {
        img1 = getRandom()
        do { img2 = getRandom() } while (img2 === img1)
        img3 = getRandom()
      }

      resultadoRef.current = [img1, img2, img3]
      let terminadas = 0

      const onDone = () => {
        terminadas++
        if (terminadas === 3) {
          setGirando(false)
          setJugado(true)
          if (data.gano) {
            setGano(true)
          } else {
            setGano(false)
          }
        }
      }

      girarColumna(0, img1, 20, onDone)
      setTimeout(() => girarColumna(1, img2, 25, onDone), 300)
      setTimeout(() => girarColumna(2, img3, 30, onDone), 600)
    }, 500)
  }

  const handleReclamar = async () => {
    setReclamando(true)
    setConfeti(true)
    if (tokensGanados > 0) {
      const u = localStorage.getItem('usuario')
      if (u) {
        const usr = JSON.parse(u)
        fetch('/api/tokens/saldo?usuario_id=' + usr.id).then(r => r.json()).then(d => {
          window.dispatchEvent(new CustomEvent('biored:tokens-changed', { detail: { saldo: d.saldo || 0 } }))
        })
      }
    }
    setTimeout(() => { setReclamado(true); setTimeout(() => onCerrar(), 1500) }, 2000)
  }

  return (
    <>
      {confeti && <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none' }} />}

      <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
        <div className="relative bg-gray-900 rounded-3xl w-full overflow-hidden" style={{ maxWidth: 400, padding: '1.5rem' }}>

          <h1 className="text-xl font-bold text-yellow-400 text-center mb-4">🎰 TRAGAMONEDAS</h1>

          <div className="flex gap-2 justify-center mb-4">
            {[0, 1, 2].map(col => (
              <div key={col} className="bg-white rounded-xl overflow-hidden border-4 border-yellow-400 flex flex-col items-center justify-center" style={{ width: 85, height: 240 }}>
                {columnas[col].map((img, i) => (
                  <img key={i} src={img || ''} className="w-full object-cover" style={{ height: 240 }} />
                ))}
              </div>
            ))}

            <div className="flex flex-col items-center justify-center ml-2" style={{ minWidth: 48 }}>
              <div
                onClick={handleJalar}
                style={{ cursor: girando || jugado ? 'not-allowed' : 'pointer', userSelect: 'none' }}
              >
                <div style={{
                  width: 14,
                  height: jalando ? 100 : 60,
                  background: 'linear-gradient(to bottom, #silver, #aaa)',
                  backgroundColor: '#aaa',
                  borderRadius: 8,
                  margin: '0 auto',
                  transition: 'height 0.25s ease',
                  boxShadow: '2px 2px 6px rgba(0,0,0,0.5)'
                }} />
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: jalando ? '#b91c1c' : '#ef4444',
                  border: '3px solid #fef08a',
                  margin: '4px auto 0',
                  transition: 'background 0.2s, transform 0.2s',
                  transform: jalando ? 'scale(0.9)' : 'scale(1)',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.5)'
                }} />
              </div>
              <p className="text-yellow-400 text-xs mt-2 text-center" style={{ fontSize: 10 }}>
                {girando ? 'Girando' : jugado ? '' : 'Jalar'}
              </p>
            </div>
          </div>

          {jugado && gano === true && !reclamado && (
            <div className="flex flex-col items-center gap-3 mt-2">
              <p className="text-2xl font-bold text-yellow-400 text-center">GANASTE {tokensGanados} tokens!</p>
              <button
                onClick={handleReclamar}
                disabled={reclamando}
                className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold py-4 rounded-2xl text-lg"
              >
                {reclamando ? 'Reclamando...' : 'Reclamar mis tokens!'}
              </button>
            </div>
          )}

          {jugado && gano === false && (
            <div className="flex flex-col items-center gap-3 mt-2">
              <p className="text-gray-400 text-sm text-center">No ganaste esta vez. Sigue comprando para jugar de nuevo.</p>
              <button onClick={onCerrar} className="w-full bg-gray-700 text-white font-bold py-3 rounded-2xl">
                Cerrar
              </button>
            </div>
          )}

          {reclamado && (
            <p className="text-center text-green-400 font-bold mt-2">Token acreditado!</p>
          )}
        </div>
      </div>
    </>
  )
}