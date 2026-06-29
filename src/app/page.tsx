'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  const [config, setConfig] = useState<any>(null)
  const [splash, setSplash] = useState(true)
  const [videoTerminado, setVideoTerminado] = useState(false)
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null)

  useEffect(() => {
    fetch('/api/configuracion').then(r => r.json()).then(d => setConfig(d)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!videoRef) return
    const handleEnded = () => setVideoTerminado(true)
    const handleTimeUpdate = () => {
      if (videoRef.duration && videoRef.currentTime >= videoRef.duration - 0.3) {
        setVideoTerminado(true)
      }
    }
    videoRef.addEventListener('ended', handleEnded)
    videoRef.addEventListener('timeupdate', handleTimeUpdate)
    return () => {
      videoRef.removeEventListener('ended', handleEnded)
      videoRef.removeEventListener('timeupdate', handleTimeUpdate)
    }
  }, [videoRef])

  const handleEntrar = () => {
    setSplash(false)
    if (videoRef) videoRef.play()
  }

  if (splash) {
    return (
      <main className='min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-black'>
        <div className='relative z-10 flex flex-col items-center gap-8 px-6 w-full max-w-sm'>
          <div className='text-center'>
            <h1 className='text-5xl font-bold text-white tracking-tight'>BIO<span className='text-red-400'>RED</span></h1>
            <p className='text-white mt-2 text-sm opacity-80'>Tu red de bienestar</p>
          </div>
          <button onClick={handleEntrar} className='w-full bg-white text-green-800 font-semibold py-6 text-base rounded-2xl'>
            Entrar
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className='min-h-screen flex flex-col items-center justify-center relative overflow-hidden'>
      {config?.video_url && !videoTerminado ? (
        <video
          ref={el => setVideoRef(el)}
          src={config.video_url}
          className='absolute inset-0 w-full h-full object-cover'
          playsInline
          muted
        />
      ) : config?.imagen_url ? (
        <img src={config.imagen_url} className='absolute inset-0 w-full h-full object-cover' />
      ) : (
        <div className='absolute inset-0 bg-black' />
      )}

      <div className='absolute inset-0 bg-black bg-opacity-40' />

      <div className='relative z-10 flex flex-col items-center gap-8 px-6 w-full max-w-sm'>
        <div className='text-center'>
          <h1 className='text-5xl font-bold text-white tracking-tight'>BIO<span className='text-red-400'>RED</span></h1>
          <p className='text-white mt-2 text-sm opacity-80'>Tu red de bienestar</p>
        </div>
        <div className='flex flex-col gap-4 w-full'>
          <Link href='/login' className='w-full'>
            <Button className='w-full bg-white text-green-800 hover:bg-green-50 font-semibold py-6 text-base rounded-2xl'>Ya tengo cuenta</Button>
          </Link>
          <Link href='/registro' className='w-full'>
            <Button className='w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-6 text-base rounded-2xl'>Se parte de nosotros</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}