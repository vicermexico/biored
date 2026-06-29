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
  const sucursales = [{id:'1',nombre:'Sucursal Norte'},{id:'2',nombre:'Sucursal Sur'},{id:'3',nombre:'Sucursal Centro'}]
  const router = useRouter()

  useEffect(() => { const c = localStorage.getItem('carrito'); if (c) setItems(JSON.parse(c)) }, [])

  const tipo = items.length > 0 ? items[0].tipo : 'biored'
  const total = items.reduce((acc, i) => acc + (i.precio || 0) * i.cantidad, 0)
  const totalTokens = items.reduce((acc, i) => acc + (i.precio_tokens || 0) * i.cantidad, 0)
  const totalCantidad = items.reduce((acc, i) => acc + i.cantidad, 0)

  const handlePedir = async () => {
    if (!sucursal) { setError('Selecciona una sucursal'); return }
    if (tipo === 'biored' && totalCantidad < 6) { setError('Minimo 6 productos para pedido BIORED'); return }
    const u = localStorage.getItem('usuario')
    if (!u) { router.push('/login'); return }
    const usuario = JSON.parse(u)
    setCargando(true)
    const suc = sucursales.find(s => s.id === sucursal)
    const res = await fetch('/api/pedidos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ usuario_id: usuario.id, tipo, sucursal_id: sucursal, sucursal_nombre: suc?.nombre, items, total, total_tokens: totalTokens }) })
    const data = await res.json()
    if (res.ok) { localStorage.removeItem('carrito'); router.push('/pedidos') }
    else { setError(JSON.stringify(data)); setCargando(false) }
  }

  return (
    <main className='min-h-screen bg-gray-50 pb-24'>
      <div className='bg-green-700 px-6 pt-10 pb-6'>
        <h1 className='text-2xl font-bold text-white'>Mi Carrito</h1>
      </div>
      <div className='px-6 py-6 flex flex-col gap-4'>
        {items.length === 0 ? (
          <div className='bg-white rounded-2xl p-8 shadow-sm text-center'>
            <svg xmlns='http://www.w3.org/2000/svg' className='w-12 h-12 text-gray-300 mx-auto mb-3' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' /></svg>
            <p className='text-gray-500 text-sm'>Tu carrito esta vacio</p>
          </div>
        ) : (
          <div className='bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3'>
            {items.map((item, i) => (
              <div key={i} className='flex justify-between items-center py-2 border-b border-gray-100'>
                <div>
                  <p className='font-medium text-sm'>{item.nombre}</p>
                  <p className='text-xs text-gray-400'>x{item.cantidad}</p>
                </div>
                <p className='font-bold text-green-700'>{item.tipo === 'biored' ? '$' + (item.precio || 0) * item.cantidad : (item.precio_tokens || 0) * item.cantidad + ' tokens'}</p>
              </div>
            ))}
            <div className='flex justify-between items-center pt-2'>
              <p className='font-bold text-gray-800'>Total</p>
              <p className='font-bold text-green-700 text-lg'>{tipo === 'biored' ? '$' + total : totalTokens + ' tokens'}</p>
            </div>
          </div>
        )}
        {error && <p className='text-red-500 text-sm text-center bg-red-50 p-3 rounded-xl'>{error}</p>}
        <div className='bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3'>
          <p className='font-medium text-gray-700'>Donde recoges tu pedido?</p>
          {sucursales.map(s => (
            <button key={s.id} onClick={() => setSucursal(s.id)} className={'w-full text-left px-4 py-3 rounded-xl border text-sm ' + (sucursal === s.id ? 'border-green-500 bg-green-50 text-green-700 font-medium' : 'border-gray-200 text-gray-600')}>
              {s.nombre}
            </button>
          ))}
        </div>
        <Button onClick={handlePedir} disabled={cargando || items.length === 0} className='w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-6 rounded-2xl'>
          {cargando ? 'Procesando...' : 'Pagar en efectivo en sucursal'}
        </Button>
      </div>
      <NavBar />
    </main>
  )
}