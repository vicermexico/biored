'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import NavBar from '@/components/NavBar'

function badgeClasses(estado: string) {
  if (estado === 'pendiente') return 'bg-red-50 text-red-600'
  if (estado === 'separado') return 'bg-yellow-50 text-yellow-700'
  return 'bg-green-50 text-green-600'
}

function badgeLabel(estado: string) {
  if (estado === 'pendiente') return 'Pedido sin pagar / Mercancía no lista'
  if (estado === 'separado') return 'Pedido sin pagar / Mercancía lista para recoger'
  return 'Pedido pagado'
}

function PedidoCard({ p }: { p: any }) {
  const entregado = p.estado === 'entregado'
  return (
    <div className='bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3'>
      <div className='flex justify-between items-start'>
        <div>
          <p className='font-bold text-gray-800'>Pedido #{String(p.numero).padStart(4, '0')}</p>
          <p className='text-xs text-gray-400'>{new Date(p.created_at).toLocaleDateString()}</p>
        </div>
        <span className={'text-xs font-medium px-3 py-1 rounded-full ' + badgeClasses(p.estado)}>
          {badgeLabel(p.estado)}
        </span>
      </div>
      {p.estado === 'separado' && (
        <div className='bg-yellow-50 border border-yellow-200 rounded-xl p-3'>
          <p className='text-sm font-semibold text-yellow-700'>¡Tu mercancía está lista! Ya puedes ir a recogerla</p>
        </div>
      )}
      <div className='bg-gray-50 rounded-xl p-3 flex flex-col gap-2'>
        {(p.detalle_pedidos || []).map((item: any, i: number) => (
          <div key={i} className='flex justify-between items-center'>
            <div>
              <p className='text-sm text-gray-700'>{item.nombre_producto}</p>
              <p className='text-xs text-gray-400'>x{item.cantidad}</p>
            </div>
            <p className='text-sm font-medium text-gray-800'>
              {p.tipo === 'biored'
                ? '$' + (item.precio_unitario || 0) * item.cantidad
                : (item.precio_tokens_unitario || 0) * item.cantidad + ' tokens'}
            </p>
          </div>
        ))}
      </div>
      <div className='bg-gray-50 rounded-xl p-3'>
        <p className='text-xs text-gray-400'>Sucursal</p>
        <p className='text-sm font-medium text-gray-700'>{p.sucursal_nombre}</p>
      </div>
      {entregado && (
        <div className='bg-gray-50 rounded-xl p-3 flex flex-col gap-1'>
          <p className='text-xs text-gray-400'>Fecha de entrega</p>
          <p className='text-sm font-medium text-gray-700'>{new Date(p.updated_at).toLocaleDateString()}</p>
          {p.terapeuta_nombre && (
            <>
              <p className='text-xs text-gray-400 mt-1'>Terapeuta</p>
              <p className='text-sm font-medium text-gray-700'>{p.terapeuta_nombre}</p>
            </>
          )}
        </div>
      )}
      {!entregado && (
        <div className='bg-gray-100 rounded-xl p-3 flex justify-between items-center'>
          <div>
            <p className='text-xs text-gray-400'>NIP de entrega</p>
            <p className='text-2xl font-bold text-gray-900 tracking-widest'>{p.nip_entrega}</p>
          </div>
          <a href='https://maps.google.com' target='_blank' className='bg-gray-900 text-white text-xs px-3 py-2 rounded-xl'>📍 Como llegar</a>
        </div>
      )}
      <p className='text-right font-bold text-gray-900'>{p.tipo === 'biored' ? '$' + p.total : p.total_tokens + ' tokens'}</p>
    </div>
  )
}

type Vista = null | 'sinrecoger' | 'recibidos'

export default function Pedidos() {
  const [pedidos, setPedidos] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [vista, setVista] = useState<Vista>(null)

  useEffect(() => {
    const u = localStorage.getItem('usuario')
    if (!u) return
    const usuario = JSON.parse(u)
    fetch('/api/pedidos?usuario_id=' + usuario.id)
      .then(r => r.json())
      .then(data => { setPedidos(data.pedidos || data || []); setCargando(false) })
  }, [])

  const sinRecoger = pedidos.filter(p => p.estado === 'pendiente' || p.estado === 'separado')
  const recibidos = pedidos.filter(p => p.estado === 'entregado')

  const listaActual = vista === 'sinrecoger' ? sinRecoger : recibidos

  if (vista !== null) {
    return (
      <main className='min-h-screen bg-gray-50 pb-24'>
        <div className='bg-gray-900 px-6 pt-10 pb-6'>
          <button onClick={() => setVista(null)} className='text-white text-sm font-medium mb-3 flex items-center gap-1'>
            ← Regresar
          </button>
          <h1 className='text-2xl font-bold text-white'>
            {vista === 'sinrecoger' ? 'Sin recoger' : 'Pedidos Recibidos'}
          </h1>
        </div>
        <div className='px-6 py-6 flex flex-col gap-4'>
          {listaActual.length === 0 ? (
            <div className='bg-white rounded-2xl p-8 shadow-sm text-center'>
              <p className='text-gray-500 text-sm'>No hay pedidos en esta sección</p>
            </div>
          ) : (
            listaActual.map(p => <PedidoCard key={p.id} p={p} />)
          )}
        </div>
        <NavBar />
      </main>
    )
  }

  return (
    <main className='min-h-screen bg-gray-50 pb-24'>
      <div className='bg-gray-900 px-6 pt-10 pb-6'>
        <h1 className='text-2xl font-bold text-white'>Mis Pedidos</h1>
      </div>
      <div className='px-6 py-6 flex flex-col gap-4'>
        {cargando ? (
          <div className='bg-gray-200 rounded-2xl h-24 animate-pulse'></div>
        ) : (
          <>
            <button
              onClick={() => setVista('sinrecoger')}
              className='bg-yellow-50 border border-yellow-200 rounded-2xl p-6 flex flex-col gap-2 text-left shadow-sm active:scale-95 transition-transform'
            >
              <p className='text-2xl font-bold text-yellow-700'>{sinRecoger.length}</p>
              <p className='text-base font-semibold text-yellow-800'>Pedidos Sin recoger</p>
              <p className='text-xs text-yellow-600'>Pendientes y listos para recoger</p>
            </button>
            <button
              onClick={() => setVista('recibidos')}
              className='bg-green-50 border border-green-200 rounded-2xl p-6 flex flex-col gap-2 text-left shadow-sm active:scale-95 transition-transform'
            >
              <p className='text-2xl font-bold text-green-700'>{recibidos.length}</p>
              <p className='text-base font-semibold text-green-800'>Pedidos Recibidos</p>
              <p className='text-xs text-green-600'>Historial de pedidos entregados</p>
            </button>
          </>
        )}
      </div>
      <NavBar />
    </main>
  )
}
