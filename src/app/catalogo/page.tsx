'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Catalogo() {
  const [productos, setProductos] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    fetch('/api/productos/biored').then(r => r.json()).then(data => { setProductos(data); setCargando(false) }).catch(() => setCargando(false))
  }, [])

  return (
    <main className='min-h-screen bg-gray-50 pb-24'>
      <div className='bg-green-700 px-6 pt-10 pb-6'>
        <h1 className='text-2xl font-bold text-white'>Catalogo BIORED</h1>
        <p className='text-green-200 text-sm'>Minimo 6 productos por compra</p>
      </div>
      <div className='px-6 py-6 grid grid-cols-2 gap-4'>
        {cargando ? (<><div className='bg-gray-200 rounded-2xl h-48 animate-pulse'></div><div className='bg-gray-200 rounded-2xl h-48 animate-pulse'></div></>) : productos.length === 0 ? (<div className='col-span-2 bg-white rounded-2xl p-8 shadow-sm text-center'><p className='text-4xl mb-3'>🌿</p><p className='text-gray-500 text-sm'>No hay productos disponibles</p></div>) : (productos.map(p => (<Link href={'/catalogo/' + p.id} key={p.id}><div className='bg-white rounded-2xl overflow-hidden shadow-sm'><div className='bg-gray-100 h-36 flex items-center justify-center'>{p.foto_url ? <img src={p.foto_url} alt={p.nombre} className='w-full h-full object-cover' /> : <span className='text-4xl'>🌿</span>}</div><div className='p-3'><p className='font-semibold text-sm text-gray-800'>{p.nombre}</p><p className='text-xs text-gray-400 mt-1'>{p.descripcion_corta}</p><p className='text-green-700 font-bold mt-2'></p></div></div></Link>)))}
      </div>
      <nav className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-3 px-6'>
        <Link href='/dashboard' className='flex flex-col items-center gap-1'><span className='text-xl'>🏠</span><span className='text-xs text-gray-400'>Inicio</span></Link>
        <Link href='/pedidos' className='flex flex-col items-center gap-1'><span className='text-xl'>📦</span><span className='text-xs text-gray-400'>Pedidos</span></Link>
        <Link href='/red' className='flex flex-col items-center gap-1'><span className='text-xl'>🌐</span><span className='text-xs text-gray-400'>Mi Red</span></Link>
        <Link href='/perfil' className='flex flex-col items-center gap-1'><span className='text-xl'>👤</span><span className='text-xs text-gray-400'>Perfil</span></Link>
      </nav>
    </main>
  )
}