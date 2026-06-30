'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'

export default function Home() {
  const [config, setConfig] = useState<any>(null)
  const [iniciado, setIniciado] = useState(false)
  const [videoTerminado, setVideoTerminado] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    fetch('/api/configuracion').then(r => r.json()).then(d => setConfig(d)).catch(() => {})
  }, [])

  const handleEntrar = () => {
    setIniciado(true)
    const v = videoRef.current
    if (v) {
      v.currentTime = 0
      v.muted = false
      v.play().catch(() => setVideoTerminado(true))
    } else {
      setVideoTerminado(true)
    }
  }

  if (!iniciado) {
    return (
      <main className='min-h-screen flex flex-col items-center justify-center bg-black'>
        <div className='flex flex-col items-center gap-8 px-6 w-full max-w-sm'>
          <div className='text-center'>
            <h1 className='text-5xl font-bold text-white tracking-tight'>DR BIO<span className='text-red-400'>RED</span></h1>
            <p className='text-white mt-2 text-sm opacity-80'>Tu red de bienestar</p>
          </div>
          <button onClick={handleEntrar} className='w-full bg-white text-green-800 font-semibold py-6 text-base rounded-2xl'>
            Entrar
          </button>
        </div>
        {config?.video_url && (
          <video ref={videoRef} src={config.video_url} className='hidden' playsInline muted preload='auto' />
        )}
      </main>
    )
  }

  if (iniciado && !videoTerminado) {
    return (
      <main className='min-h-screen bg-black relative'>
        <video
          src={config.video_url}
          autoPlay
          playsInline
          onEnded={() => setVideoTerminado(true)}
          style={{ width: '100%', height: '100vh', objectFit: 'cover' }}
        />
        <div className='absolute inset-0 flex flex-col items-center justify-center gap-8 px-6'>
          <h1 className='text-4xl font-bold text-white tracking-tight' style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>DR BIO<span className='text-red-400'>RED</span></h1>
          <div className='w-full max-w-sm flex flex-col gap-3'>
            <Link href='/login' className='w-full'>
              <button className='w-full bg-white text-green-800 hover:bg-green-50 font-semibold py-4 text-base rounded-2xl shadow-lg'>Ya tengo cuenta</button>
            </Link>
            <Link href='/registro' className='w-full'>
              <button className='w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 text-base rounded-2xl shadow-lg'>Se parte de nosotros</button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className='min-h-screen flex flex-col items-center justify-center relative overflow-hidden'>
      {config?.imagen_url ? (
        <img src={config.imagen_url} className='absolute inset-0 w-full h-full object-cover' />
      ) : (
        <div className='absolute inset-0 bg-black' />
      )}
      <div className='absolute inset-0 bg-black bg-opacity-30' />
      <div className='relative z-10 flex flex-col items-center gap-8 px-6 w-full max-w-sm'>
        <div className='text-center'>
          <h1 className='text-5xl font-bold text-white tracking-tight'>DR BIO<span className='text-red-400'>RED</span></h1>
          <p className='text-white mt-2 text-sm opacity-80'>Tu red de bienestar</p>
        </div>
        <div className='flex flex-col gap-4 w-full'>
          <Link href='/login' className='w-full'>
            <button className='w-full bg-white text-green-800 hover:bg-green-50 font-semibold py-6 text-base rounded-2xl'>Ya tengo cuenta</button>
          </Link>
          <Link href='/registro' className='w-full'>
            <button className='w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-6 text-base rounded-2xl'>Se parte de nosotros</button>
          </Link>
        </div>
      </div>
    </main>
  )
}