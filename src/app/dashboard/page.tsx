'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Dashboard() {
  const [usuario, setUsuario] = useState<any>(null)
  const [tokens, setTokens] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const u = localStorage.getItem('usuario')
    if (!u) { router.push('/login'); return }
    setUsuario(JSON.parse(u))
  }, [])

  if (!usuario) return <div className='min-h-screen flex items-center justify-center'><p className='text-gray-400'>Cargando...</p></div>

  return (
    <main className='min-h-screen bg-gray-50'>
      <div className='bg-green-700 px-6 pt-10 pb-6'>
        <h1 className='text-2xl font-bold text-white'>Hola, {usuario.nombre}</h1>
        <p className='text-green-200 text-sm'>Bienvenido a BIORED</p>
      </div>
      <div className='px-6 py-6 flex flex-col gap-4'>
        <div className='grid grid-cols-2 gap-4'>
          <div className='bg-white rounded-2xl p-4 flex flex-col gap-1 shadow-sm'>
            <p className='text-xs text-gray-400'>Mis Tokens</p>
            <p className='text-3xl font-bold text-green-700'>{tokens}</p>
          </div>
          <div className='bg-white rounded-2xl p-4 flex flex-col gap-1 shadow-sm'>
            <p className='text-xs text-gray-400'>Invitados activos</p>
            <p className='text-3xl font-bold text-green-700'>0</p>
          </div>
        </div>
        <div className='bg-white rounded-2xl p-4 shadow-sm'>
          <p className='text-xs text-gray-400 mb-3'>Pedidos recientes</p>
          <p className='text-sm text-gray-400 text-center py-4'>Aun no tienes pedidos</p>
        </div>
        <div className='flex flex-col gap-3'>
          <Link href='/catalogo'>
            <Button className='w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-6 rounded-2xl'>Catalogo BIORED</Button>
          </Link>
          <Link href='/biotokens'>
            <Button className='w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-6 rounded-2xl'>Catalogo BioTokens</Button>
          </Link>
        </div>
      </div>
      <nav className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-3 px-6'>
        <Link href='/dashboard' className='flex flex-col items-center gap-1'><span className='text-xl'>🏠</span><span className='text-xs text-green-700 font-medium'>Inicio</span></Link>
        <Link href='/pedidos' className='flex flex-col items-center gap-1'><span className='text-xl'>📦</span><span className='text-xs text-gray-400'>Pedidos</span></Link>
        <Link href='/red' className='flex flex-col items-center gap-1'><span className='text-xl'>🌐</span><span className='text-xs text-gray-400'>Mi Red</span></Link>
        <Link href='/perfil' className='flex flex-col items-center gap-1'><span className='text-xl'>👤</span><span className='text-xs text-gray-400'>Perfil</span></Link>
      </nav>
    </main>
  )
}