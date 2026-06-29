'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
export default function DetalleBiotoken({ params }: { params: { id: string } }) {
  const [producto, setProducto] = useState<any>(null)
  const [cantidad, setCantidad] = useState(1)
  const [tokensDisponibles, setTokensDisponibles] = useState(0)
  const router = useRouter()
  useEffect(() => {
    fetch('/api/productos/biotokens').then(r => r.json()).then(data => {
      const p = data.find((x: any) => x.id === params.id)
      setProducto(p)
    })
    const u = localStorage.getItem('usuario')
    if (u) {
      const usuario = JSON.parse(u)
      fetch('/api/tokens?usuario_id=' + usuario.id).then(r => r.json()).then(data => setTokensDisponibles(data.saldo || 0))
    }
  }, [])
  const handleAgregar = () => {
    if (cantidad * producto.precio_tokens > tokensDisponibles) { alert('Tokens insuficientes'); return }
    const carrito = JSON.parse(localStorage.getItem('carrito') || '[]')
    const existe = carrito.find((i: any) => i.id === producto.id)
    if (existe) { existe.cantidad += cantidad } else { carrito.push({ id: producto.id, nombre: producto.nombre, precio_tokens: producto.precio_tokens, cantidad, tipo: 'biotokens' }) }
    localStorage.setItem('carrito', JSON.stringify(carrito))
    router.push('/carrito')
  }
  if (!producto) return <div className='min-h-screen flex items-center justify-center'><p className='text-gray-400'>Cargando...</p></div>
  return (
    <main className='min-h-screen bg-gray-50 pb-24'>
      <div className='bg-gray-100 h-64 flex items-center justify-center'>
        {producto.foto_url ? <img src={producto.foto_url} alt={producto.nombre} className='w-full h-full object-cover' /> : <span className='text-8xl'>🎁</span>}
      </div>
      <div className='px-6 py-6 flex flex-col gap-4'>
        <div><h1 className='text-2xl font-bold text-gray-800'>{producto.nombre}</h1><p className='text-red-500 font-bold text-xl mt-1'>{producto.precio_tokens} tokens</p><p className='text-xs text-gray-400 mt-1'>Tienes {tokensDisponibles} tokens disponibles</p></div>
        <p className='text-gray-500 text-sm leading-relaxed'>{producto.descripcion_larga || producto.descripcion_corta}</p>
        <div className='bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-4'>
          <div className='flex items-center justify-between'>
            <p className='font-medium text-gray-700'>Cantidad</p>
            <div className='flex items-center gap-4'>
              <button onClick={() => setCantidad(Math.max(1, cantidad - 1))} className='w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold'>-</button>
              <span className='text-lg font-bold'>{cantidad}</span>
              <button onClick={() => setCantidad(cantidad + 1)} className='w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center text-lg font-bold'>+</button>
            </div>
          </div>
          <Button onClick={handleAgregar} className='w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-6 rounded-2xl'>Agregar al carrito</Button>
        </div>
        <button onClick={() => router.back()} className='text-center text-sm text-gray-400'>Volver al catalogo</button>
      </div>
    </main>
  )
}