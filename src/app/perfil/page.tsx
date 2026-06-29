'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function Perfil() {
  const [usuario, setUsuario] = useState<any>(null)
  const [nombre, setNombre] = useState('')
  const [celular, setCelular] = useState('')
  const [correo, setCorreo] = useState('')
  const [nip, setNip] = useState('')
  const [guardado, setGuardado] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const u = localStorage.getItem('usuario')
    if (!u) { router.push('/login'); return }
    const data = JSON.parse(u)
    setUsuario(data)
    setNombre(data.nombre || '')
    setCelular(data.celular || '')
    setCorreo(data.correo || '')
  }, [])

  const handleGuardar = () => {
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2000)
  }

  const handleEliminar = () => {
    if (confirm('Estas seguro? Esta accion no se puede deshacer')) {
      localStorage.removeItem('usuario')
      router.push('/')
    }
  }

  if (!usuario) return <div className='min-h-screen flex items-center justify-center'><p className='text-gray-400'>Cargando...</p></div>

  return (
    <main className='min-h-screen bg-gray-50 pb-24'>
      <div className='bg-green-700 px-6 pt-10 pb-6'>
        <h1 className='text-2xl font-bold text-white'>Mi Perfil</h1>
      </div>
      <div className='px-6 py-6 flex flex-col gap-4'>
        <div className='bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center gap-3'>
          <div className='w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl'>👤</div>
          <button className='text-sm text-green-700 font-medium'>Cambiar foto</button>
        </div>
        <div className='bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-4'>
          {guardado && <p className='text-green-600 text-sm text-center font-medium'>Guardado correctamente</p>}
          <div className='flex flex-col gap-1'>
            <label className='text-sm text-gray-600 font-medium'>Nombre</label>
            <input type='text' value={nombre} onChange={e => setNombre(e.target.value)} className='border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500' />
          </div>
          <div className='flex flex-col gap-1'>
            <label className='text-sm text-gray-600 font-medium'>Celular</label>
            <input type='tel' value={celular} onChange={e => setCelular(e.target.value)} className='border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500' />
          </div>
          <div className='flex flex-col gap-1'>
            <label className='text-sm text-gray-600 font-medium'>Correo</label>
            <input type='email' value={correo} onChange={e => setCorreo(e.target.value)} className='border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500' />
          </div>
          <div className='flex flex-col gap-1'>
            <label className='text-sm text-gray-600 font-medium'>Nuevo NIP</label>
            <input type='password' value={nip} onChange={e => setNip(e.target.value)} placeholder='Deja vacio para no cambiar' maxLength={4} className='border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500' />
          </div>
          <Button onClick={handleGuardar} className='w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-6 rounded-2xl'>Guardar cambios</Button>
        </div>
        <button onClick={() => { localStorage.removeItem('usuario'); router.push('/') }} className='text-center text-sm text-gray-400 py-2'>Cerrar sesion</button>
        <button onClick={handleEliminar} className='text-center text-sm text-red-400 py-2'>Eliminar mi cuenta</button>
      </div>
      <nav className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-3 px-6'>
        <a href='/dashboard' className='flex flex-col items-center gap-1'><span className='text-xl'>🏠</span><span className='text-xs text-gray-400'>Inicio</span></a>
        <a href='/pedidos' className='flex flex-col items-center gap-1'><span className='text-xl'>📦</span><span className='text-xs text-gray-400'>Pedidos</span></a>
        <a href='/red' className='flex flex-col items-center gap-1'><span className='text-xl'>🌐</span><span className='text-xs text-gray-400'>Mi Red</span></a>
        <a href='/perfil' className='flex flex-col items-center gap-1'><span className='text-xl'>👤</span><span className='text-xs text-green-700 font-medium'>Perfil</span></a>
      </nav>
    </main>
  )
}