'use client'
import { useState, useEffect, use, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function DetalleBiotoken({ params }: { params: Promise<{ id: string }> }) {  const { id } = use(params)
  const [producto, setProducto] = useState<any>(null)
  const [cantidad, setCantidad] = useState(1)
  const [tokensDisponibles, setTokensDisponibles] = useState(0)
  const [videoTerminado, setVideoTerminado] = useState(false)
  const [todasLasFotos, setTodasLasFotos] = useState<string[]>([])
  const [fotoActiva, setFotoActiva] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/productos/biotokens').then(r => r.json()).then(data => {
      const p = data.find((x: any) => x.id === id)
      if (p) {
        setProducto(p)
        const fotos: string[] = []
        if (p.foto_url) fotos.push(p.foto_url)
        try {
          const adicionales = JSON.parse(p.fotos_adicionales || '[]')
          adicionales.filter((f: string) => f).forEach((f: string) => fotos.push(f))
        } catch {}
        setTodasLasFotos(fotos)
        if (!p.video_url) setVideoTerminado(true)
      }
    })
    const u = localStorage.getItem('usuario')
    if (u) {
      const usuario = JSON.parse(u)
      fetch('/api/tokens/saldo?usuario_id=' + usuario.id).then(r => r.json()).then(data => setTokensDisponibles(data.saldo || 0))
    }
  }, [id])

  const handleAgregar = () => {
    if (cantidad * producto.precio_tokens > tokensDisponibles) { alert('Tokens insuficientes'); return }
    const carrito = JSON.parse(localStorage.getItem('carrito') || '[]')
    const existe = carrito.find((i: any) => i.id === producto.id)
    if (existe) { existe.cantidad += cantidad } else { carrito.push({ id: producto.id, nombre: producto.nombre, precio_tokens: producto.precio_tokens, cantidad, tipo: 'biotokens', foto_url: producto.foto_url || null }) }
    localStorage.setItem('carrito', JSON.stringify(carrito))
    router.push('/carrito')
  }

  if (!producto) return (
    <div className='min-h-screen flex items-center justify-center'>
      <p className='text-gray-400'>Cargando...</p>
    </div>
  )

  return (
    <main className='min-h-screen bg-gray-50 pb-24'>
      <div className='relative'>
        <button onClick={() => router.back()} className='absolute top-4 left-4 z-10 bg-black bg-opacity-40 text-white rounded-full p-2'>
          <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' /></svg>
        </button>

        {producto.video_url && !videoTerminado ? (
          <div className='w-full bg-black' style={{ height: '45vh' }}>
            <video
              ref={videoRef}
              src={producto.video_url}
              className='w-full h-full object-cover'
              autoPlay
              playsInline
              disablePictureInPicture
              onEnded={() => setVideoTerminado(true)}
              style={{ pointerEvents: 'none' }}
            />
          </div>
        ) : (
          <div className='relative bg-gray-100 overflow-hidden' style={{ height: '45vh' }}>
            {todasLasFotos.length > 0 ? (
              <>
                <img src={todasLasFotos[fotoActiva]} className='w-full h-full object-cover' />
                {todasLasFotos.length > 1 && (
                  <>
                    <button onClick={() => setFotoActiva(f => Math.max(0, f - 1))} disabled={fotoActiva === 0} className='absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 text-white rounded-full p-2 disabled:opacity-20'>
                      <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' /></svg>
                    </button>
                    <button onClick={() => setFotoActiva(f => Math.min(todasLasFotos.length - 1, f + 1))} disabled={fotoActiva === todasLasFotos.length - 1} className='absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 text-white rounded-full p-2 disabled:opacity-20'>
                      <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' /></svg>
                    </button>
                    <div className='absolute bottom-2 left-0 right-0 flex justify-center gap-1'>
                      {todasLasFotos.map((_, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full ${i === fotoActiva ? 'bg-white' : 'bg-white bg-opacity-50'}`} />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className='w-full h-full flex items-center justify-center'><span className='text-8xl'>🎁</span></div>
            )}
          </div>
        )}
      </div>

      <div className='px-6 py-4 flex flex-col gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800'>{producto.nombre}</h1>
          <p className='text-red-500 font-bold text-xl mt-1'>{producto.precio_tokens} tokens</p>
          <p className='text-xs text-gray-400 mt-1'>Tienes {tokensDisponibles} tokens disponibles</p>
        </div>
        <p className='text-gray-500 text-sm leading-relaxed'>{producto.descripcion_larga || producto.descripcion_corta}</p>
        <div className='bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-4'>
          <div className='flex items-center justify-between'>
            <p className='font-medium text-gray-700'>Cantidad</p>
            <div className='flex items-center gap-4'>
              <button onClick={() => setCantidad(Math.max(1, cantidad - 1))} className='w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold'>-</button>
              <span className='text-lg font-bold'>{cantidad}</span>
              <button onClick={() => setCantidad(cantidad + 1)} className='w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center text-lg font-bold'>+</button>            </div>
          </div>
          <Button onClick={handleAgregar} className='w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-6 rounded-2xl'>Agregar al carrito</Button>
        </div>
        <button onClick={() => router.back()} className='text-center text-sm text-gray-400'>Volver al catalogo</button>
      </div>
    </main>
  )
}