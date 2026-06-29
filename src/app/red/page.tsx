'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function MiRed() {
  const [nivelActivo, setNivelActivo] = useState(1)
  const [red, setRed] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [link, setLink] = useState('')

  useEffect(() => {
    const u = localStorage.getItem('usuario')
    if (!u) return
    const usuario = JSON.parse(u)
    setLink(window.location.origin + '/registro?ref=' + usuario.id)
    fetch('/api/red?usuario_id=' + usuario.id).then(r => r.json()).then(data => { setRed(data); setCargando(false) })
  }, [])

  const copiarLink = () => { navigator.clipboard.writeText(link); alert('Link copiado!') }

  const nivel1 = red.map((r: any) => r.usuarios)

  return (
    <main className='min-h-screen bg-gray-50 pb-24'>
      <div className='bg-green-700 px-6 pt-10 pb-6'>
        <h1 className='text-2xl font-bold text-white'>Mi Red</h1>
        <p className='text-green-200 text-sm'>Hasta 5 niveles de invitados</p>
      </div>
      <div className='px-6 py-6 flex flex-col gap-4'>
        <div className='flex gap-2 overflow-x-auto pb-1'>
          {[1,2,3,4,5].map(n => (<button key={n} onClick={() => setNivelActivo(n)} className={'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ' + (nivelActivo === n ? 'bg-green-700 text-white' : 'bg-white text-gray-500 border border-gray-200')}>Nivel {n}</button>))}
        </div>
        <div className='flex flex-col gap-3'>
          {cargando ? (<div className='bg-gray-200 rounded-2xl h-16 animate-pulse'></div>) : nivelActivo === 1 && nivel1.length === 0 ? (
            <div className='bg-white rounded-2xl p-8 shadow-sm text-center'><p className='text-4xl mb-3'>🌐</p><p className='text-gray-500 text-sm'>Aun no tienes invitados en este nivel</p></div>
          ) : nivelActivo === 1 ? (
            nivel1.map((inv: any, i: number) => (
              <div key={i} className='bg-white rounded-2xl p-4 shadow-sm flex justify-between items-center'>
                <div><p className='font-medium text-gray-800'>{inv.nombre}</p><p className='text-xs text-gray-400'>{inv.celular}</p></div>
                <span className={'text-xs font-medium px-3 py-1 rounded-full ' + (inv.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400')}>{inv.activo ? 'Activo' : 'Inactivo'}</span>
              </div>
            ))
          ) : (
            <div className='bg-white rounded-2xl p-8 shadow-sm text-center'><p className='text-4xl mb-3'>🌐</p><p className='text-gray-500 text-sm'>Aun no tienes invitados en este nivel</p></div>
          )}
        </div>
        <Button onClick={copiarLink} className='w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-6 rounded-2xl'>Invita a un amigo</Button>
      </div>
      <nav className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-3 px-6'>
        <Link href='/dashboard' className='flex flex-col items-center gap-1'><span className='text-xl'>🏠</span><span className='text-xs text-gray-400'>Inicio</span></Link>
        <Link href='/pedidos' className='flex flex-col items-center gap-1'><span className='text-xl'>📦</span><span className='text-xs text-gray-400'>Pedidos</span></Link>
        <Link href='/red' className='flex flex-col items-center gap-1'><span className='text-xl'>🌐</span><span className='text-xs text-green-700 font-medium'>Mi Red</span></Link>
        <Link href='/perfil' className='flex flex-col items-center gap-1'><span className='text-xl'>👤</span><span className='text-xs text-gray-400'>Perfil</span></Link>
      </nav>
    </main>
  )
}