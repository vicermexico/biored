'use client'
import { useRef, useState } from 'react'

type Fase = 'inicio' | 'reproduciendo' | 'terminado'

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
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleJugar = () => {
    setFase('reproduciendo')
    setTimeout(() => videoRef.current?.play(), 50)
  }

  const handleReclamar = async () => {
    setCargando(true)
    try {
      await fetch('/api/juego/reclamar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id, tipo }),
      })
    } catch {}
    setCargando(false)
    onCerrar()
  }

  return (
    <div className='fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center px-6'>
      <div className='bg-gray-900 rounded-3xl w-full max-w-sm p-6 flex flex-col items-center gap-4'>

        {fase === 'inicio' && (
          <>
            <p className='text-4xl'>🎮</p>
            <h1 className='text-2xl font-bold text-white text-center'>¡FELICIDADES!</h1>
            <p className='text-gray-300 text-sm text-center'>Has ganado un juego GRATIS</p>
            <button
              onClick={handleJugar}
              className='bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-4 rounded-2xl text-lg w-full mt-2'
            >
              JUGAR
            </button>
          </>
        )}

        {(fase === 'reproduciendo' || fase === 'terminado') && (
          <>
            <video
              ref={videoRef}
              src={video_url}
              className='w-full rounded-2xl object-cover'
              style={{ maxHeight: '50vh' }}
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
          </>
        )}

      </div>
    </div>
  )
}
