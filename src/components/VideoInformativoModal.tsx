'use client'
import { useState, useRef, useEffect } from 'react'

interface Video {
  id: string
  video_url: string
  titulo: string
  veces_mostrar: number
}

interface Props {
  videos: Video[]
  usuario_id: string
  onTerminar: () => void
}

export default function VideoInformativoModal({ videos, usuario_id, onTerminar }: Props) {
  const [indice, setIndice] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  const video = videos[indice]

  useEffect(() => {
    if (video && videoRef.current) {
      videoRef.current.load()
      videoRef.current.play().catch(() => {})
      registrarVista(video.id)
    }
  }, [indice])

  const registrarVista = async (video_id: string) => {
    await fetch('/api/videos-informativos/vista', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ video_id, usuario_id })
    })
  }

  const cerrar = () => {
    if (indice < videos.length - 1) {
      setIndice(i => i + 1)
    } else {
      onTerminar()
    }
  }

  if (!video) return null

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center px-4'
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div className='relative w-full max-w-lg bg-black rounded-3xl overflow-hidden shadow-2xl'>
        <button
          onClick={cerrar}
          className='absolute top-3 right-3 z-10 bg-black bg-opacity-60 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold hover:bg-opacity-80'
        >
          ✕
        </button>

        {videos.length > 1 && (
          <div className='absolute top-3 left-3 z-10 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full'>
            {indice + 1} / {videos.length}
          </div>
        )}

        <video
          ref={videoRef}
          src={video.video_url}
          className='w-full'
          style={{ maxHeight: '70vh', pointerEvents: 'none' }}
          playsInline
          disablePictureInPicture
          onEnded={cerrar}
        />

        {video.titulo && (
          <div className='bg-gray-900 px-4 py-3'>
            <p className='text-white text-sm font-medium'>{video.titulo}</p>
          </div>
        )}
      </div>
    </div>
  )
}