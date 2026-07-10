'use client'
import { useRef, useState } from 'react'

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
  const [tokensGanados, setTokensGanados] = useState(tokens)
  const [cargando, setCargando] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleVerPremio = () => {
    setFase('reproduciendo')
    setTimeout(() => videoRef.current?.play(), 50)
  }

  const handleReclamar = async () => {
    setCargando(true)
    try {
      const res = await fetch('/api/juego/reclamar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id, tipo }),
      })
      const data = await res.json()
      if (res.ok) {
        setTokensGanados(data.tokens)
        setFase('reclamado')
      }
    } catch {}
    setCargando(false)
  }

  return (
    <div className='fixed inset-0 z-50 bg-gray-900 flex flex-col items-center justify-center px-6'>

      {/* Fase inicio */}
      {fase === 'inicio' && (
        <div className='flex flex-col items-center gap-6 text-center'>
          <p className='text-6xl'>🎮</p>
          <h1 className='text-3xl font-bold text-white'>¡FELICIDADES!</h1>
          <p className='text-gray-300 text-base'>Has ganado un juego GRATIS</p>
          <button
            onClick={handleVerPremio}
            className='bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-4 rounded-2xl text-lg mt-2'
          >
            JUGAR
          </button>
        </div>
      )}

      {/* Fase reproduciendo / terminado */}
      {(fase === 'reproduciendo' || fase === 'terminado') && (
        <div className='w-full flex flex-col items-center gap-6'>
          <video
            ref={videoRef}
            src={video_url}
            className='w-full rounded-2xl object-cover'
            style={{ maxHeight: '70vh' }}
            playsInline
            disablePictureInPicture
            onEnded={() => setFase('terminado')}
          />
          {fase === 'terminado' && (
            <button
              onClick={handleReclamar}
              disabled={cargando}
              className='bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold px-8 py-4 rounded-2xl text-lg w-full'
            >
              {cargando ? 'Reclamando...' : '¡Reclamar mis tokens!'}
            </button>
          )}
        </div>
      )}

      {/* Fase reclamado */}
      {fase === 'reclamado' && (
        <div className='flex flex-col items-center gap-6 text-center'>
          <p className='text-6xl'>🎉</p>
          <h1 className='text-3xl font-bold text-white'>¡Ganaste {tokensGanados} tokens!</h1>
          <p className='text-gray-300 text-base'>Ya fueron acreditados a tu cuenta</p>
          <button
            onClick={onCerrar}
            className='bg-white text-gray-900 font-bold px-8 py-4 rounded-2xl text-lg mt-2'
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  )
}
