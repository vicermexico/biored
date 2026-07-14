'use client'
import { useState, useRef, useEffect, useCallback } from 'react'

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
  const indiceRef = useRef(0)
  const cerradoRef = useRef(false)

  const video = videos[indice]

  const cerrar = useCallback(() => {
    if (cerradoRef.current) return
    const siguiente = indiceRef.current + 1
    if (siguiente < videos.length) {
      indiceRef.current = siguiente
      setIndice(siguiente)
    } else {
      cerradoRef.current = true
      onTerminar()
    }
  }, [videos.length, onTerminar])

  useEffect(() => {
    indiceRef.current = indice
    cerradoRef.current = false
    const v = videoRef.current
    if (!v || !video) return

    v.load()
    v.play().catch(() => {})

    fetch('/api/videos-informativos/vista', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ video_id: video.id, usuario_id })
    }).catch(() => {})

    const handleEnded = () => cerrar()
    const handleTimeUpdate = () => {
      if (v.duration && v.currentTime >= v.duration - 0.5) {
        cerrar()
      }
    }

    v.addEventListener('ended', handleEnded)
    v.addEventListener('timeupdate', handleTimeUpdate)
    return () => {
      v.removeEventListener('ended', handleEnded)
      v.removeEventListener('timeupdate', handleTimeUpdate)
    }
  }, [indice, cerrar, usuario_id, video])

  if (!video) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="relative w-full max-w-lg bg-black rounded-3xl overflow-hidden shadow-2xl">
        <button
          onClick={cerrar}
          className="absolute top-3 right-3 z-10 bg-black bg-opacity-60 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold hover:bg-opacity-80"
          style={{ fontSize: 18 }}
        >
          ✕
        </button>

        {videos.length > 1 && (
          <div className="absolute top-3 left-3 z-10 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
            {indice + 1} / {videos.length}
          </div>
        )}

        <video
          ref={videoRef}
          src={video.video_url}
          className="w-full"
          style={{ maxHeight: '70vh', pointerEvents: 'none' }}
          playsInline
          disablePictureInPicture
        />

        {video.titulo && (
          <div className="bg-gray-900 px-4 py-3">
            <p className="text-white text-sm font-medium">{video.titulo}</p>
          </div>
        )}
      </div>
    </div>
  )
}