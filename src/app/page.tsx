'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'

export default function Home() {
  const [config, setConfig] = useState<any>(null)
  const [iniciado, setIniciado] = useState(false)
  const [videoTerminado, setVideoTerminado] = useState(false)
  const [pulso, setPulso] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    fetch('/api/configuracion').then(r => r.json()).then(d => setConfig(d)).catch(() => {})
    const interval = setInterval(() => setPulso(p => !p), 1200)
    return () => clearInterval(interval)
  }, [])

  const handleEntrar = () => {
    setIniciado(true)
    const v = videoRef.current
    if (v && config?.video_url) {
      v.currentTime = 0
      v.play().catch(() => setVideoTerminado(true))
    } else {
      setVideoTerminado(true)
    }
  }

  const mostrarVideo = iniciado && !videoTerminado
  const mostrarFinal = videoTerminado

  return (
    <main className='min-h-screen relative overflow-hidden bg-black'>

      {config?.video_url && (
        <video
          ref={videoRef}
          src={config.video_url}
          playsInline
          preload='auto'
          onEnded={() => setVideoTerminado(true)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100vh',
            objectFit: 'cover',
            visibility: mostrarVideo ? 'visible' : 'hidden',
          }}
        />
      )}

      {mostrarFinal && (
        config?.imagen_url
          ? <img src={config.imagen_url} className='absolute inset-0 w-full h-full object-cover' />
          : <div className='absolute inset-0 bg-white' />
      )}

      {!iniciado && (
        <div className='absolute inset-0 z-10 flex flex-col items-center justify-center bg-black'>
          <div className='flex flex-col items-center gap-8 px-6 w-full max-w-sm'>
            <div className='text-center'>
              <h1 className='text-5xl font-bold text-white tracking-tight'>DR BIO<span className='text-red-400'>RED</span></h1>
              <p className='text-white mt-2 text-sm opacity-80'>Tu red de bienestar</p>
            </div>
            <div className='flex flex-col items-center gap-2 w-full'>
              <button
                onClick={handleEntrar}
                style={{
                  opacity: pulso ? 1 : 0.5,
                  transition: 'opacity 0.6s ease-in-out',
                }}
                className='w-full bg-white text-gray-900 font-semibold py-6 text-base rounded-2xl'
              >
                Iniciar sesión
              </button>
              <p className='text-white text-xs opacity-50'>Da clic para entrar a tu panel DrBioRed</p>
            </div>
          </div>
        </div>
      )}

      {mostrarVideo && (
        <div className='absolute inset-0 z-10 flex flex-col items-center justify-center gap-8 px-6'>
          <h1 className='text-4xl font-bold text-white tracking-tight' style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>DR BIO<span className='text-red-400'>RED</span></h1>
          <div className='w-full max-w-sm flex flex-col gap-3'>
            <Link href='/login' className='w-full'>
              <button className='w-full bg-white text-gray-900 hover:bg-gray-100 font-semibold py-4 text-base rounded-2xl shadow-lg'>Iniciar sesión</button>
            </Link>
          </div>
        </div>
      )}

      {mostrarFinal && (
        <div className='relative z-10 flex flex-col items-center justify-center gap-8 px-6 w-full max-w-sm mx-auto min-h-screen'>
          <div className='text-center'>
            <h1 className='text-5xl font-bold text-white tracking-tight' style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>DR BIO<span className='text-red-400'>RED</span></h1>
            <p className='text-white mt-2 text-sm opacity-90' style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>Tu red de bienestar</p>
          </div>
          <div className='flex flex-col gap-3 w-full items-center'>
            <Link href='/login' className='w-full'>
              <button className='w-full bg-white text-gray-900 hover:bg-gray-100 font-semibold py-6 text-base rounded-2xl shadow-lg'>Iniciar sesión</button>
            </Link>
            <p className='text-white text-xs opacity-50'>Da clic para entrar a tu panel DrBioRed</p>
          </div>
        </div>
      )}

    </main>
  )
}