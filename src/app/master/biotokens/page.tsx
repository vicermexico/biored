'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
export default function MasterBiotokens() {
  const [productos, setProductos] = useState<any[]>([])
  const [agregando, setAgregando] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [nuevo, setNuevo] = useState({ nombre: '', descripcion_corta: '', precio_tokens: '' })
  useEffect(() => {
    fetch('/api/master/productos/biotokens').then(r => r.json()).then(data => { setProductos(data); setCargando(false) })
  }, [])
  const handleAgregar = async () => {
    if (!nuevo.nombre || !nuevo.precio_tokens) return
    const res = await fetch('/api/master/productos/biotokens', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nuevo) })
    const data = await res.json()
    if (res.ok) { setProductos([data, ...productos]); setNuevo({ nombre: '', descripcion_corta: '', precio_tokens: '' }); setAgregando(false) }
  }
  const handleEliminar = async (id: string) => {
    if (!confirm('Eliminar premio?')) return
    const res = await fetch('/api/master/productos/biotokens', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (res.ok) setProductos(productos.filter(p => p.id !== id))
  }
  return (
    <main className='min-h-screen bg-gray-50 pb-24'>
      <div className='bg-red-500 px-6 pt-10 pb-6 flex justify-between items-end'>
        <div><h1 className='text-2xl font-bold text-white'>Catalogo BioTokens</h1><p className='text-red-100 text-sm'>{productos.length} premios</p></div>
        <button onClick={() => setAgregando(true)} className='bg-white text-red-500 font-bold px-4 py-2 rounded-xl text-sm'>+ Agregar</button>
      </div>
      <div className='px-6 py-6 flex flex-col gap-3'>
        {agregando && (<div className='bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3 border-2 border-red-500'>
          <p className='font-medium text-gray-700'>Nuevo premio</p>
          <input type='text' placeholder='Nombre' value={nuevo.nombre} onChange={e => setNuevo({...nuevo, nombre: e.target.value})} className='border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none' />
          <input type='text' placeholder='Descripcion corta' value={nuevo.descripcion_corta} onChange={e => setNuevo({...nuevo, descripcion_corta: e.target.value})} className='border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none' />
          <input type='number' placeholder='Tokens' value={nuevo.precio_tokens} onChange={e => setNuevo({...nuevo, precio_tokens: e.target.value})} className='border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none' />
          <div className='flex gap-2'>
            <Button onClick={handleAgregar} className='flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl'>Guardar</Button>
            <Button onClick={() => setAgregando(false)} className='flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl'>Cancelar</Button>
          </div>
        </div>)}
        {cargando ? (<div className='bg-gray-200 rounded-2xl h-16 animate-pulse'></div>) : productos.length === 0 ? (<div className='bg-white rounded-2xl p-8 shadow-sm text-center'><p className='text-gray-400 text-sm'>No hay premios</p></div>) : (productos.map(p => (<div key={p.id} className='bg-white rounded-2xl p-4 shadow-sm flex justify-between items-center'><div><p className='font-medium text-gray-800'>{p.nombre}</p><p className='text-red-500 font-bold'>{p.precio_tokens} tokens</p></div><button onClick={() => handleEliminar(p.id)} className='text-red-400 text-sm font-medium'>Eliminar</button></div>)))}
      </div>
    </main>
  )
}