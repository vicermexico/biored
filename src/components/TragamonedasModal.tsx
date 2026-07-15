'use client'
import { useState, useEffect, useRef } from 'react'

interface Props {
  usuario_id: string
  onCerrar: () => void
}

const VELOCIDAD = 80
const GIROS_ANTES_PARAR = [20, 25, 30]

export default function TragamonedasModal({ usuario_id, onCerrar }: Props) {
  const [productos, setProductos] = useState<string[]>([])
  const [columnas, setColumnas] = useState<string[][]>([[], [], []])
  const [girando, setGirando] = useState(false)
  const [resultado, setResultado] = useState<string[] | null>(null)
  const [gano, setGano] = useState<boolean | null>(null)
  const [tokensGanados, setTokensGanados] = useState(0)
  const [confeti, setConfeti] = useState(false)
  const [jalando, setJalando] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const intervalRef = useRef<any[]>([null, null, null])
  const contadorRef = useRef([0, 0, 0])
  const resultadoFinalRef = useRef<string[]>([])

  useEffect(() => {
    fetch('/api/productos/biored').then(r => r.json()).then(data => {
      const fotos = data.filter((p: any) => p.foto_url).map((p: any) => p.foto_url)
      if (fotos.length > 0) setProductos(fotos)
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
    contadorRef.current[col] = 0
    intervalRef.current[col] = setInterval(() => {
      contadorRef.current[col]++
      setColumnas(prev => {
        const nueva = [...prev]
        if (contadorRef.current[col] >= giros) {
          nueva[col] = [imagenFinal]
          clearInterval(intervalRef.current[col])
          onDone()
        } else {
          nueva[col] = [getRandom()]
        }
        return nueva
      })
    }, VELOCIDAD)
  }

  const handleJalar = async () => {
    if (girando || productos.length === 0) return
    setJalando(true)
    setResultado(null)
    setGano(null)

    setTimeout(async () => {
      setJalando(false)
      setGirando(true)

      const res = await fetch('/api/tragamonedas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id })
      })
      const data = await res.json()

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

      resultadoFinalRef.current = [img1, img2, img3]

      let terminadas = 0
      const onDone = () => {
        terminadas++
        if (terminadas === 3) {
          setResultado([img1, img2, img3])
          setGirando(false)
          if (data.gano) {
            setGano(true)
            setConfeti(true)
            window.dispatchEvent(new CustomEvent('biored:tokens-changed', { detail: { saldo: data.tokens_ganados } }))
          } else {
            setGano(false)
          }
        }
      }

      girarColumna(0, img1, GIROS_ANTES_PARAR[0], onDone)
      setTimeout(() => girarColumna(1, img2, GIROS_ANTES_PARAR[1], onDone), 300)
      setTimeout(() => girarColumna(2, img3, GIROS_ANTES_PARAR[2], onDone), 600)
    }, 400)
  }

  return (
    <>
      {confeti && <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none' }} />}

      <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
        <div className="bg-gray-900 rounded-3xl w-full flex flex-col items-center gap-6 overflow-hidden" style={{ maxWidth: 420, padding: '2rem' }}>
          <h1 className="text-2xl font-bold text-white text-center">TRAGAMONEDAS</h1>

          <div className="flex gap-3 w-full justify-center">
            {[0, 1, 2].map(col => (
              <div key={col} className="bg-gray-800 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-gray-600" style={{ width: 90, height: 90 }}>
                {columnas[col][0] ? (
                  <img src={columnas[col][0]} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">❓</span>
                )}
              </div>
            ))}
          </div>

          {gano === true && (
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-400">GANASTE!</p>
              <p className="text-white text-sm mt-1">+{tokensGanados} tokens acreditados</p>
            </div>
          )}
          {gano === false && (
            <p className="text-gray-400 text-sm text-center">Sigue intentando...</p>
          )}

          <div className="flex flex-col items-center gap-3 w-full">
            <div
              onClick={handleJalar}
              style={{
                cursor: girando ? 'not-allowed' : 'pointer',
                userSelect: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <div style={{
                width: 16,
                height: jalando ? 80 : 50,
                background: '#ef4444',
                borderRadius: 8,
                transition: 'height 0.2s ease',
                margin: '0 auto'
              }} />
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: jalando ? '#dc2626' : '#ef4444',
                border: '3px solid #fff',
                transition: 'background 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
              }} />
            </div>
            <p className="text-gray-400 text-xs">
              {girando ? 'Girando...' : 'Toca la palanca'}
            </p>
          </div>

          <button onClick={onCerrar} className="text-gray-500 text-sm">
            Cerrar
          </button>
        </div>
      </div>
    </>
  )
}