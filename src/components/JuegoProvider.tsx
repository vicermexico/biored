'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import JuegoModal from './JuegoModal'
import TragamonedasModal from './TragamonedasModal'

export default function JuegoProvider() {
  const [juego, setJuego] = useState<{ video_url: string; tokens: number; tipo: string } | null>(null)
  const [tragamonedas, setTragamonedas] = useState(false)
  const [eligiendo, setEligiendo] = useState(false)
  const [usuarioId, setUsuarioId] = useState<string | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const rutasPublicas = ['/', '/login', '/registro']
    if (rutasPublicas.includes(pathname)) return
    const u = localStorage.getItem('usuario')
    if (!u) return
    const usr = JSON.parse(u)
    setUsuarioId(usr.id)
    if (sessionStorage.getItem('juego_visto')) return

    const verificar = async () => {
      if (sessionStorage.getItem('videos_informativos_activos')) return

      const [juegoRes, tragaRes] = await Promise.all([
        fetch('/api/juego/verificar?usuario_id=' + usr.id).then(r => r.json()).catch(() => ({ aplica: false })),
        fetch('/api/tragamonedas').then(r => r.json()).catch(() => ({ activo: false }))
      ])

      const tieneJuego = juegoRes.aplica
      const tieneTragamonedas = tragaRes.activo

      setTimeout(() => {
        if (sessionStorage.getItem('videos_informativos_activos')) return

        if (tieneJuego && tieneTragamonedas) {
          setJuego({ video_url: juegoRes.video_url, tokens: juegoRes.tokens, tipo: juegoRes.tipo })
          setTragamonedas(true)
          setEligiendo(true)
        } else if (tieneJuego) {
          setJuego({ video_url: juegoRes.video_url, tokens: juegoRes.tokens, tipo: juegoRes.tipo })
        } else if (tieneTragamonedas) {
          setTragamonedas(true)
        }
      }, 1000)
    }

    const handleVideosTerminados = () => { verificar() }
    window.addEventListener('biored:videos-informativos-terminados', handleVideosTerminados)
    verificar()
    return () => { window.removeEventListener('biored:videos-informativos-terminados', handleVideosTerminados) }
  }, [pathname])

  const handleCerrarJuego = () => {
    sessionStorage.setItem('juego_visto', '1')
    setJuego(null)
    setTragamonedas(false)
    setEligiendo(false)
    const u = localStorage.getItem('usuario')
    if (u) {
      const usr = JSON.parse(u)
      fetch('/api/tokens/saldo?usuario_id=' + usr.id)
        .then(r => r.json())
        .then(d => { window.dispatchEvent(new CustomEvent('biored:tokens-changed', { detail: { saldo: d.saldo || 0 } })) })
        .catch(() => {})
    }
  }

  if (!usuarioId) return null

  if (eligiendo && juego && tragamonedas) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
        <div className="bg-gray-900 rounded-3xl w-full flex flex-col items-center gap-6" style={{ maxWidth: 380, padding: '2rem' }}>
          <p className="text-4xl">🎮</p>
          <h1 className="text-2xl font-bold text-white text-center">FELICIDADES!</h1>
          <p className="text-gray-300 text-sm text-center">Tienes derecho a jugar. Elige tu juego:</p>
          <button
            onClick={() => { setEligiendo(false); setTragamonedas(false) }}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-4 rounded-2xl text-lg"
          >
            🎰 Ruleta
          </button>
          <button
            onClick={() => { setEligiendo(false); setJuego(null) }}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-6 py-4 rounded-2xl text-lg"
          >
            🍒 Tragamonedas
          </button>
          <button onClick={handleCerrarJuego} className="text-gray-500 text-sm">Cerrar</button>
        </div>
      </div>
    )
  }

  if (juego && !eligiendo) {
    return (
      <JuegoModal
        video_url={juego.video_url}
        tokens={juego.tokens}
        tipo={juego.tipo}
        usuario_id={usuarioId}
        onCerrar={handleCerrarJuego}
      />
    )
  }

  if (tragamonedas && !eligiendo) {
    return (
      <TragamonedasModal
        usuario_id={usuarioId}
        onCerrar={handleCerrarJuego}
      />
    )
  }

  return null
}