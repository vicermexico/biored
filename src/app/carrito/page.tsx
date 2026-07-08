'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import NavBar from '@/components/NavBar'

export default function Carrito() {
  const [items, setItems] = useState<any[]>([])
  const [sucursal, setSucursal] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [sucursales, setSucursales] = useState<any[]>([])
  const [cargandoSucursales, setCargandoSucursales] = useState(true)
  const [errorSucursales, setErrorSucursales] = useState('')
  const router = useRouter()

  useEffect(() => {
    const c = localStorage.getItem('carrito')
    if (c) setItems(JSON.parse(c))
  }, [])

  useEffect(() => {
    fetch('/api/sucursales')
      .then(r => r.json())
      .then(d => {
        if (d.error) setErrorSucursales('No se pudieron cargar las sucursales')
        else setSucursales(d)
      })
      .catch(() => setErrorSucursales('No se pudieron cargar las sucursales'))
      .finally(() => setCargandoSucursales(false))
  }, [])

  const tipo = items.length > 0 ? items[0].tipo : 'biored'
  const total = items.reduce((acc, i) => acc + (i.precio || 0) * i.cantidad, 0)
  const totalTokens = items.reduce((acc, i) => acc + (i.precio_tokens || 0) * i.cantidad, 0)
  const totalCantidad = items.reduce((acc, i) => acc + i.cantidad, 0)

  const eliminarItem = (index: number) => {
    const nuevos = items.filter((_, i) => i !== index)
    setItems(nuevos)
    localStorage.setItem('carrito', JSON.stringify(nuevos))
  }

  const handlePedir = async () => {
    if (!sucursal) { setError('Selecciona una sucursal'); return }
    if (tipo === 'biored' && totalCantidad < 6) { setError('Minimo 6 productos para pedido BIORED'); return }
    const u = localStorage.getItem('usuario')
    if (!u) { router.push('/login'); return }
    const usuario = JSON.parse(u)
    setCargando(true)
    const suc = sucursales.find(s => s.id === sucursal)
    const res = await fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario_id: usuario.id, tipo, sucursal_id: sucursal, sucursal_nombre: suc?.name, items, total, total_tokens: totalTokens })
    })
    const data = await res.json()
    if (res.ok) { localStorage.removeItem('carrito'); router.push('/pedidos') }
    else { setError(JSON.stringify(data)); setCargando(false) }
  }

  return (
    <main className='min-h-screen bg-gray-50 pb-24'>
      <div className='bg-gray-900 px-6 pt-10 pb-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-white'>Mi Carrito</h1>
            <p className='text-gray-400 text-sm mt-0.5'>{totalCantidad} {totalCantidad === 1 ? 'producto' : 'productos'}</p>
          </div>
          <div className='relative'>
            <svg xmlns='http://www.w3.org/2000/svg' className='w-9 h-9 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' />
            </svg>
            {totalCantidad > 0 && (
              <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center'>
                {totalCantidad}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className='px-6 py-6 flex flex-col gap-4'>
        <button
          onClick={() => router.push(tipo === 'biotokens' ? '/biotokens' : '/catalogo')}
          className='text-gray-600 text-sm font-medium flex items-center gap-1 self-start'
        >
          ← Seguir comprando
        </button>
        {items.length === 0 ? (
          <div className='bg-white rounded-2xl p-8 shadow-sm text-center'>
            <svg xmlns='http://www.w3.org/2000/svg' className='w-12 h-12 text-gray-300 mx-auto mb-3' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' /></svg>
            <p className='text-gray-500 text-sm'>Tu carrito esta vacio</p>
          </div>
        ) : (
          <>
            <div className='bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3'>
              {items.map((item, i) => (
                <div key={i} className='flex items-center gap-3 py-2 border-b border-gray-100 last:border-0'>
                  {item.foto_url ? (
                    <img src={item.foto_url} alt={item.nombre} className='w-14 h-14 rounded-xl object-cover flex-shrink-0' />
                  ) : (
                    <div className='w-14 h-14 rounded-xl bg-gray-100 flex-shrink-0' />
                  )}
                  <div className='flex-1 min-w-0'>
                    <p className='font-medium text-sm text-gray-800 truncate'>{item.nombre}</p>
                    <p className='text-xs text-gray-400'>x{item.cantidad}</p>
                    <p className='font-bold text-gray-900 text-sm mt-0.5'>
                      {item.tipo === 'biored' ? '$' + (item.precio || 0) * item.cantidad : (item.precio_tokens || 0) * item.cantidad + ' tokens'}
                    </p>
                  </div>
                  <button
                    onClick={() => eliminarItem(i)}
                    className='text-gray-400 hover:text-red-500 text-xl font-light flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors'
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className='bg-white rounded-2xl p-4 shadow-sm flex justify-between items-center'>
              <p className='font-bold text-gray-800'>Total a Pagar</p>
              <p className='font-bold text-gray-900 text-2xl'>{tipo === 'biored' ? '$' + total : totalTokens + ' tokens'}</p>
            </div>
          </>
        )}
        {error && <p className='text-red-500 text-sm text-center bg-red-50 p-3 rounded-xl'>{error}</p>}
        <div className='bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3'>
          <p className='font-medium text-gray-700'>Donde recoges tu pedido?</p>
          {cargandoSucursales && (
            <p className='text-sm text-gray-400 text-center py-2'>Cargando sucursales...</p>
          )}
          {errorSucursales && (
            <p className='text-sm text-red-500 text-center bg-red-50 p-3 rounded-xl'>{errorSucursales}</p>
          )}
          {!cargandoSucursales && !errorSucursales && sucursales.map(s => (
            <button key={s.id} onClick={() => setSucursal(s.id)} className={'w-full text-left px-4 py-3 rounded-xl border text-sm ' + (sucursal === s.id ? 'border-gray-900 bg-gray-100 text-gray-900 font-medium' : 'border-gray-200 text-gray-600')}>
              {s.name}
            </button>
          ))}
        </div>
        <Button onClick={handlePedir} disabled={cargando || items.length === 0} className='w-full bg-gray-900 hover:bg-black text-white font-semibold py-6 rounded-2xl'>
          {cargando ? 'Procesando...' : 'Pagar en efectivo en sucursal'}
        </Button>
      </div>
      <NavBar />
    </main>
  )
}
