'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Master() {
  const router = useRouter()
  const [stats, setStats] = useState({ usuarios: 0, tokens: 0, pedidosBiored: 0, pedidosBiotokens: 0 })
  const [calculando, setCalculando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    fetch('/api/master/stats').then(r => r.json()).then(d => setStats(d)).catch(() => {})
  }, [])

  async function calcularTokens() {
    setCalculando(true)
    setMensaje('')
    try {
      const r = await fetch('/api/tokens/calcular', { method: 'POST' })
      const d = await r.json()
      setMensaje(d.mensaje || d.error || 'Listo')
      fetch('/api/master/stats').then(r => r.json()).then(d => setStats(d)).catch(() => {})
    } catch {
      setMensaje('Error al calcular')
    }
    setCalculando(false)
  }

  const handleSalir = () => {
    if (confirm('¿Seguro que quieres cerrar sesión?')) {
      localStorage.removeItem('usuario')
      router.push('/login')
    }
  }

  return (
    <main className='min-h-screen bg-gray-50 pb-24'>
      <div className='bg-green-700 px-6 pt-10 pb-6 flex justify-between items-start'>
        <div>
          <h1 className='text-2xl font-bold text-white'>Panel Master</h1>
          <p className='text-green-200 text-sm'>Administrador BIORED</p>
        </div>
        <button onClick={handleSalir} className='bg-white text-green-700 font-bold px-4 py-2 rounded-xl text-sm'>Salir</button>
      </div>
      <div className='px-6 py-6 flex flex-col gap-4'>
        <div className='grid grid-cols-2 gap-4'>
          <div className='bg-white rounded-2xl p-4 flex flex-col gap-1 shadow-sm'>
            <p className='text-xs text-gray-400'>Usuarios activos</p>
            <p className='text-3xl font-bold text-green-700'>{stats.usuarios}</p>
          </div>
          <div className='bg-white rounded-2xl p-4 flex flex-col gap-1 shadow-sm'>
            <p className='text-xs text-gray-400'>Tokens acreditados</p>
            <p className='text-3xl font-bold text-green-700'>{stats.tokens}</p>
          </div>
          <div className='bg-white rounded-2xl p-4 flex flex-col gap-1 shadow-sm'>
            <p className='text-xs text-gray-400'>Pedidos BIORED</p>
            <p className='text-3xl font-bold text-green-700'>{stats.pedidosBiored}</p>
          </div>
          <div className='bg-white rounded-2xl p-4 flex flex-col gap-1 shadow-sm'>
            <p className='text-xs text-gray-400'>Pedidos BioTokens</p>
            <p className='text-3xl font-bold text-red-500'>{stats.pedidosBiotokens}</p>
          </div>
        </div>

        <button onClick={calcularTokens} disabled={calculando} className='bg-green-700 text-white rounded-2xl p-4 font-medium shadow-sm disabled:opacity-50'>
          {calculando ? 'Calculando...' : 'Calcular Tokens del Mes'}
        </button>
        {mensaje && <p className='text-center text-sm text-gray-600'>{mensaje}</p>}

        <div className='flex flex-col gap-3 mt-2'>
          <Link href='/master/catalogo'>
            <div className='bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between'>
              <p className='font-medium text-gray-800'>Catalogo BIORED</p>
              <span className='text-gray-300'>›</span>
            </div>
          </Link>
          <Link href='/master/biotokens'>
            <div className='bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between'>
              <p className='font-medium text-gray-800'>Catalogo BioTokens</p>
              <span className='text-gray-300'>›</span>
            </div>
          </Link>
          <Link href='/master/usuarios'>
            <div className='bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between'>
              <p className='font-medium text-gray-800'>Usuarios</p>
              <span className='text-gray-300'>›</span>
            </div>
          </Link>
          <Link href='/master/configuracion'>
            <div className='bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between'>
              <p className='font-medium text-gray-800'>Configuracion</p>
              <span className='text-gray-300'>›</span>
            </div>
          </Link>
        </div>
      </div>
    </main>
  )
}