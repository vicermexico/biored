'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import NavBar from '@/components/NavBar'
export default function Catalogo() {
  const [productos, setProductos] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  useEffect(() => {
    fetch('/api/productos/biored').then(r => r.json()).then(data => { setProductos(data);setCargando(false) }).catch(() => setCargando(false))
  }, [])
  return (
    <main className='min-h-screen bg-gray-50 pb-24'>
      <div className='bg-gray-900 px-6 pt-10 pb-6'>
        <h1 className='text-2xl font-bold text-white'>Catalogo BIORED</h1>
        <p className='text-gray-300 text-sm'>Minimo 6 productos por compra</p>
      </div>
      <div className='px-4 py-6 grid grid-cols-2 gap-4'>
        {cargando ? (
          <><div className='bg-gray-200 rounded-2xl h-56 animate-pulse'></div><div className='bg-gray-200 rounded-2xl h-56 animate-pulse'></div></>
        ) : productos.length === 0 ? (
          <div className='col-span-2 bg-white rounded-2xl p-8 shadow-sm text-center'>
            <p className='text-gray-500 text-sm'>No hay productos disponibles</p>
          </div>
        ) : (
          productos.map(p => (
            <Link href={'/catalogo/' + p.id} key={p.id}>
              <div className='bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col h-56'>
                <div className='h-32 flex-shrink-0'>
                  {p.foto_url
                    ? <img src={p.foto_url} alt={p.nombre} className='w-full h-full object-cover' />
                    : <div className='w-full h-full bg-gray-100 flex items-center justify-center'><span className='text-4xl'>🌿</span></div>}
                </div>
                <div className='p-3 flex flex-col flex-1 justify-between'>
                  <div>
                    <p className='font-semibold text-sm text-gray-800 leading-tight'>{p.nombre}</p>
                    <p className='text-xs text-gray-400 mt-1 leading-tight line-clamp-2'>{p.descripcion_corta}</p>
                  </div>
                  <p className='text-gray-900 font-bold text-sm mt-1'>${p.precio}</p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
      <NavBar />
    </main>
  )
}