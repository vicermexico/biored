'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MasterJuegos() {
  const router = useRouter()
  const [productosRequeridos, setProductosRequeridos] = useState(12)
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)

  useEffect(() => {
    fetch('/api/configuracion').then(r => r.json()).then(d => {
      setProductosRequeridos(d.juego_por_compra_cantidad || 12)
    })
  }, [])

  const handleGuardar = async () => {
    setGuardando(true)
    await fetch('/api/configuracion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ juego_por_compra_cantidad: productosRequeridos })
    })
    setGuardando(false)
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2000)
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-green-700 px-6 pt-10 pb-6">
        <button onClick={() => router.push('/master')} className="text-green-200 text-sm mb-2 block">Panel Master</button>
        <h1 className="text-2xl font-bold text-white">Juegos</h1>
        <p className="text-green-200 text-sm">Configuracion de juegos</p>
      </div>

      <div className="px-6 py-6 flex flex-col gap-4">
        {guardado && <p className="text-green-600 text-sm text-center font-medium bg-green-50 py-3 rounded-xl">Guardado correctamente</p>}

        <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3">
          <p className="font-medium text-gray-700">Productos requeridos para jugar</p>
          <p className="text-xs text-gray-400">Cuando el usuario acumule este numero de productos puede elegir un juego</p>
          <input
            type="number" min={1}
            value={productosRequeridos}
            onChange={e => setProductosRequeridos(parseInt(e.target.value) || 1)}
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500"
          />
          <button onClick={handleGuardar} disabled={guardando} className="bg-green-700 text-white font-semibold py-3 rounded-xl disabled:opacity-50">
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>

        <Link href="/master/juegos">
          <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Ruleta</p>
              <p className="text-xs text-gray-400">Configurar video y tokens del premio</p>
            </div>
            <span className="text-gray-300">›</span>
          </div>
        </Link>

        <Link href="/master/tragamonedas">
          <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Tragamonedas</p>
              <p className="text-xs text-gray-400">Configurar videos y jugadas globales</p>
            </div>
            <span className="text-gray-300">›</span>
          </div>
        </Link>
      </div>
    </main>
  )
}