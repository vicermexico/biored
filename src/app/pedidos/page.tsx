'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
export default function Pedidos() {
  const [pedidos, setPedidos] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  useEffect(() => {
    const u = localStorage.getItem('usuario')
    if (!u) return
    const usuario = JSON.parse(u)
    fetch('/api/pedidos?usuario_id=' + usuario.id).then(r => r.json()).then(data => { setPedidos(data); setCargando(false) })
  }, [])
  return (
    <main className='min-h-screen bg-gray-50 pb-24'>
      <div className='bg-green-700 px-6 pt-10 pb-6'><h1 className='text-2xl font-bold text-white'>Mis Pedidos</h1></div>
      <div className='px-6 py-6 flex flex-col gap-4'>
        {cargando ? (<div className='bg-gray-200 rounded-2xl h-24 animate-pulse'></div>) : pedidos.length === 0 ? (
          <div className='bg-white rounded-2xl p-8 shadow-sm text-center'><p className='text-4xl mb-3'>📦</p><p className='text-gray-500 text-sm'>Aun no tienes pedidos</p><Link href='/catalogo' className='text-green-700 text-sm font-medium mt-2 block'>Ver catalogo</Link></div>
        ) : (
          pedidos.map(p => (
            <div key={p.id} className='bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3'>
              <div className='flex justify-between items-start'>
                <div><p className='font-bold text-gray-800'>Pedido #{p.id.slice(-6).toUpperCase()}</p><p className='text-xs text-gray-400'>{new Date(p.created_at).toLocaleDateString()}</p></div>
                <span className={'text-xs font-medium px-3 py-1 rounded-full ' + (p.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' : p.estado === 'entregado' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>{p.estado}</span>
              </div>
              <div className='bg-gray-50 rounded-xl p-3'><p className='text-xs text-gray-400'>Sucursal</p><p className='text-sm font-medium text-gray-700'>{p.sucursal_nombre}</p></div>
              <div className='bg-green-50 rounded-xl p-3 flex justify-between items-center'>
                <div><p className='text-xs text-gray-400'>NIP de entrega</p><p className='text-2xl font-bold text-green-700 tracking-widest'>{p.nip_entrega}</p></div>
                <a href={'https://maps.google.com'} target='_blank' className='bg-green-700 text-white text-xs px-3 py-2 rounded-xl'>📍 Como llegar</a>
              </div>
              <p className='text-right font-bold text-green-700'>{p.tipo === 'biored' ? '$' + p.total : p.total_tokens + ' tokens'}</p>
            </div>
          ))
        )}
      </div>
      <nav className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-3 px-6'>
        <Link href='/dashboard' className='flex flex-col items-center gap-1'><span className='text-xl'>🏠</span><span className='text-xs text-gray-400'>Inicio</span></Link>
        <Link href='/pedidos' className='flex flex-col items-center gap-1'><span className='text-xl'>📦</span><span className='text-xs text-green-700 font-medium'>Pedidos</span></Link>
        <Link href='/red' className='flex flex-col items-center gap-1'><span className='text-xl'>🌐</span><span className='text-xs text-gray-400'>Mi Red</span></Link>
        <Link href='/perfil' className='flex flex-col items-center gap-1'><span className='text-xl'>👤</span><span className='text-xs text-gray-400'>Perfil</span></Link>
      </nav>
    </main>
  )
}