'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import NavBar from '@/components/NavBar'

export default function Perfil() {
  const [usuario, setUsuario] = useState<any>(null)
  const [nombre, setNombre] = useState('')
  const [celular, setCelular] = useState('')
  const [correo, setCorreo] = useState('')
  const [nip, setNip] = useState('')
  const [guardado, setGuardado] = useState(false)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
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

  const handleGuardar = async () => {
    if (celular.length !== 10) { setError('El celular debe tener 10 digitos'); return }
    if (nip && nip.length !== 4) { setError('El NIP debe ser de 4 digitos'); return }
    setCargando(true)
    setError('')
    try {
      const res = await fetch('/api/auth/perfil', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: usuario.id, nombre, celular, correo, nip }) })
      const data = await res.json()
      if (!res.ok) { setError(data.error); setCargando(false); return }
      localStorage.setItem('usuario', JSON.stringify(data.usuario))
      setUsuario(data.usuario)
      setNip('')
      setGuardado(true)
      setTimeout(() => setGuardado(false), 2000)
    } catch {
      setError('Error de conexion')
    }
    setCargando(false)
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
      <div className='bg-green-700 px-6 pt-10 pb-6 flex justify-between items-center'>
        <h1 className='text-2xl font-bold text-white'>Mi Perfil</h1>
        <button onClick={() => { localStorage.removeItem('usuario'); router.push('/') }} className='bg-white text-green-700 font-bold px-4 py-2 rounded-xl text-sm'>Salir</button>
      </div>
      <div className='px-6 py-6 flex flex-col gap-4'>
        <div className='bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center gap-3'>
          <div className='w-20 h-20 rounded-full bg-green-100 flex items-center justify-center'>
            <svg xmlns='http://www.w3.org/2000/svg' className='w-10 h-10 text-green-700' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' /></svg>
          </div>
          <p className='font-medium text-gray-800'>{usuario.nombre}</p>
        </div>
        <div className='bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-4'>
          {guardado && <p className='text-green-600 text-sm text-center font-medium bg-green-50 py-2 rounded-xl'>Guardado correctamente</p>}
          {error && <p className='text-red-500 text-sm text-center bg-red-50 py-2 rounded-xl'>{error}</p>}
          <div className='flex flex-col gap-1'>
            <label className='text-sm text-gray-600 font-medium'>Nombre</label>
            <input type='text' value={nombre} onChange={e => setNombre(e.target.value)} className='border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500' />
          </div>
          <div className='flex flex-col gap-1'>
            <label className='text-sm text-gray-600 font-medium'>Celular</label>
            <input type='tel' value={celular} onChange={e => { const val = e.target.value.replace(/\D/g, ''); if (val.length <= 10) setCelular(val) }} maxLength={10} className='border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500' />
          </div>
          <div className='flex flex-col gap-1'>
            <label className='text-sm text-gray-600 font-medium'>Correo</label>
            <input type='email' value={correo} onChange={e => setCorreo(e.target.value)} className='border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500' />
          </div>
          <div className='flex flex-col gap-1'>
            <label className='text-sm text-gray-600 font-medium'>Nuevo NIP</label>
            <input type='password' value={nip} onChange={e => setNip(e.target.value)} placeholder='Deja vacio para no cambiar' maxLength={4} className='border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500' />
          </div>
          <Button onClick={handleGuardar} disabled={cargando} className='w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-6 rounded-2xl'>
            {cargando ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
        <button onClick={handleEliminar} className='text-center text-sm text-red-400 py-2'>Eliminar mi cuenta</button>
      </div>
      <NavBar />
    </main>
  )
}