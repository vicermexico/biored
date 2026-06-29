'use client'
import { useState, useEffect, use, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function DetalleProducto({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [producto, setProducto] = useState<any>(null)
  const [cantidad, setCantidad] = useState(1)
  const [videoTerminado, setVideoTerminado] = useState(false)
  const [fotosAdicionales, setFotosAdicionales] = useState<string[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/productos/biored').then(r => r.json()).then(data => {
      const p = data.find((x: any) => x.id === id)
      if (p) {
        setProducto(p)
        try {
          const fotos = JSON.parse(p.fotos_adicionales || '[]')
          setFotosAdicionales(fotos.filter((f: string) => f))
        } catch { setFotosAdicionales([]) }
        if (!p.video_url) setVideoTerminado(true)
      }
    })
  }, [id])

  const handleAgregar = () => {
    const carrito = JSON.parse(localStorage.getItem('carrito') || '[]')
    const existe = carrito.find((i: any) => i.id === producto.id)
    if (existe) { existe.cantidad += cantidad } else { carrito.push({ id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad, tipo: 'biored' }) }
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
          <div className='w-full bg-black'>
            <video
              ref={videoRef}
              src={producto.video_url}
              className='w-full'
              autoPlay
              playsInline
              disablePictureInPicture
              onEnded={() => setVideoTerminado(true)}
              style={{ pointerEvents: 'none' }}
            />
          </div>
        ) : (
          <div className='bg-gray-100 h-64'>
            {producto.foto_url
              ? <img src={producto.foto_url} alt={producto.nombre} className='w-full h-full object-cover' />
              : <div className='w-full h-full flex items-center justify-center'><span className='text-8xl'>🌿</span></div>}
          </div>
        )}
      </div>

      {videoTerminado && fotosAdicionales.length > 0 && (
        <div className='px-4 pt-4 flex gap-3 overflow-x-auto'>
          {fotosAdicionales.map((foto, i) => (
            <img key={i} src={foto} className='h-24 w-24 object-cover rounded-xl flex-shrink-0' />
          ))}
        </div>
      )}

      <div className='px-6 py-4 flex flex-col gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800'>{producto.nombre}</h1>
          <p className='text-green-700 font-bold text-xl mt-1'>${producto.precio}</p>
        </div>
        <p className='text-gray-500 text-sm leading-relaxed'>{producto.descripcion_larga || producto.descripcion_corta}</p>
        <div className='bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-4'>
          <div className='flex items-center justify-between'>
            <p className='font-medium text-gray-700'>Cantidad</p>
            <div className='flex items-center gap-4'>
              <button onClick={() => setCantidad(Math.max(1, cantidad - 1))} className='w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold'>-</button>
              <span className='text-lg font-bold'>{cantidad}</span>
              <button onClick={() => setCantidad(cantidad + 1)} className='w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center text-lg font-bold'>+</button>
            </div>
          </div>
          <Button onClick={handleAgregar} className='w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-6 rounded-2xl'>Agregar al carrito</Button>
        </div>
        <button onClick={() => router.back()} className='text-center text-sm text-gray-400'>Volver al catalogo</button>
      </div>
    </main>
  )
}