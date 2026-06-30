'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  const [config, setConfig] = useState<any>(null)
  const [fase, setFase] = useState<'splash' | 'video' | 'imagen' | 'botones'>('splash')
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    fetch('/api/configuracion').then(r => r.json()).then(d => setConfig(d)).catch(() => {})
  }, [])

  const handleEntrar = () => {
    if (config?.video_url && videoRef.current) {
      setFase('video')
      videoRef.current.play().catch(() => {
        if (config?.imagen_url) setFase('imagen')
        else setFase('botones')
      })
    } else if (config?.imagen_url) {
      setFase('imagen')
    } else {
      setFase('botones')
    }
  }

  const handleVideoEnd = () => {
    if (config?.imagen_url) setFase('imagen')
    else setFase('botones')
    setTimeout(() => setFase('botones'), 3000)
  }

  return (
    <main className='min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-black'>

      {config?.video_url && (
       <video
          ref={videoRef}
          src={config.video_url}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${fase === 'video' ? 'opacity-100' : 'opacity-0'}`}
          playsInline
          muted
          autoPlay
          loop={false}
          preload='auto'
          onEnded={handleVideoEnd}
          onCanPlay={() => { if (fase === 'video' && videoRef.current) videoRef.current.play().catch(() => {}) }}
        />
      )}

      {fase === 'imagen' && config?.imagen_url && (
        <img src={config.imagen_url} className='absolute inset-0 w-full h-full object-cover' />
      )}

      <div className='absolute inset-0 bg-black bg-opacity-30' />

      <div className='relative z-10 flex flex-col items-center gap-8 px-6 w-full max-w-sm'>
        <div className='text-center'>
          <h1 className='text-5xl font-bold text-white tracking-tight'>DR BIO<span className='text-red-400'>RED</span></h1>
          <p className='text-white mt-2 text-sm opacity-80'>Tu red de bienestar</p>
        </div>

        {fase === 'splash' && (
          <button onClick={handleEntrar} className='w-full bg-white text-green-800 font-semibold py-6 text-base rounded-2xl'>
            Entrar
          </button>
        )}

        {(fase === 'botones' || fase === 'imagen') && (
          <div className='flex flex-col gap-4 w-full'>
            <Link href='/login' className='w-full'>
              <Button className='w-full bg-white text-green-800 hover:bg-green-50 font-semibold py-6 text-base rounded-2xl'>Ya tengo cuenta</Button>
            </Link>
            <Link href='/registro' className='w-full'>
              <Button className='w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-6 text-base rounded-2xl'>Se parte de nosotros</Button>
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}