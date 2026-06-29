'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import NavBar from '@/components/NavBar'

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
      <div className='bg-green-700 px-6 pt-10 pb-6'>
        <h1 className='text-2xl font-bold text-white'>Mis Pedidos</h1>
      </div>
      <div className='px-6 py-6 flex flex-col gap-4'>
        {cargando ? (
          <div className='bg-gray-200 rounded-2xl h-24 animate-pulse'></div>
        ) : pedidos.length === 0 ? (
          <div className='bg-white rounded-2xl p-8 shadow-sm text-center'>
            <svg xmlns='http://www.w3.org/2000/svg' className='w-12 h-12 text-gray-300 mx-auto mb-3' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' /></svg>
            <p className='text-gray-500 text-sm'>Aun no tienes pedidos</p>
            <Link href='/catalogo' className='text-green-700 text-sm font-medium mt-2 block'>Ver catalogo</Link>
          </div>
        ) : (
          pedidos.map(p => (
            <div key={p.id} className='bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3'>
              <div className='flex justify-between items-start'>
                <div>
                  <p className='font-bold text-gray-800'>Pedido #{p.id.slice(-6).toUpperCase()}</p>
                  <p className='text-xs text-gray-400'>{new Date(p.created_at).toLocaleDateString()}</p>
                </div>
                <span className={'text-xs font-medium px-3 py-1 rounded-full ' + (p.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' : p.estado === 'entregado' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>{p.estado}</span>
              </div>
              <div className='bg-gray-50 rounded-xl p-3'>
                <p className='text-xs text-gray-400'>Sucursal</p>
                <p className='text-sm font-medium text-gray-700'>{p.sucursal_nombre}</p>
              </div>
              <div className='bg-green-50 rounded-xl p-3 flex justify-between items-center'>
                <div>
                  <p className='text-xs text-gray-400'>NIP de entrega</p>
                  <p className='text-2xl font-bold text-green-700 tracking-widest'>{p.nip_entrega}</p>
                </div>
                <a href='https://maps.google.com' target='_blank' className='bg-green-700 text-white text-xs px-3 py-2 rounded-xl'>📍 Como llegar</a>
              </div>
              <p className='text-right font-bold text-green-700'>{p.tipo === 'biored' ? '$' + p.total : p.total_tokens + ' tokens'}</p>
            </div>
          ))
        )}
      </div>
      <NavBar />
    </main>
  )
}