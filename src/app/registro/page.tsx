'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function Registro() {
  const [nombre, setNombre] = useState('')
  const [celular, setCelular] = useState('')
  const [correo, setCorreo] = useState('')
  const [nip, setNip] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const router = useRouter()

  const ref = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('ref') : null

  const handleRegistro = async () => {
    if (!nombre || !celular || !nip) { setError('Nombre, celular y NIP son obligatorios'); return }
    if (nip.length !== 4) { setError('El NIP debe ser de 4 digitos'); return }
    setCargando(true)
    setError('')
    try {
      const res = await fetch('/api/auth/registro', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre, celular, correo, nip, ref }) })
      const data = await res.json()
      if (!res.ok) { setError(data.error); setCargando(false); return }
      localStorage.setItem('usuario', JSON.stringify(data.usuario))
      router.push('/dashboard')
    } catch (e) {
      setError('Error de conexion')
      setCargando(false)
    }
  }

  return (
    <main className='min-h-screen bg-gradient-to-b from-green-700 to-green-900 flex flex-col items-center justify-center px-6'>
      <div className='w-full max-w-sm flex flex-col gap-6'>
        <div className='text-center'>
          <h1 className='text-4xl font-bold text-white'>BIO<span className='text-red-400'>RED</span></h1>
          <p className='text-green-200 mt-1 text-sm'>Crea tu cuenta</p>
        </div>
        <div className='bg-white rounded-3xl p-6 flex flex-col gap-4'>
          {error && <p className='text-red-500 text-sm text-center'>{error}</p>}
          <div className='flex flex-col gap-1'>
            <label className='text-sm text-gray-600 font-medium'>Nombre completo</label>
            <input type='text' value={nombre} onChange={e => setNombre(e.target.value)} placeholder='Tu nombre' className='border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500' />
          </div>
          <div className='flex flex-col gap-1'>
            <label className='text-sm text-gray-600 font-medium'>Celular</label>
            <input type='tel' value={celular} onChange={e => setCelular(e.target.value)} placeholder='10 digitos' className='border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500' />
          </div>
          <div className='flex flex-col gap-1'>
            <label className='text-sm text-gray-600 font-medium'>Correo (opcional)</label>
            <input type='email' value={correo} onChange={e => setCorreo(e.target.value)} placeholder='tu@correo.com' className='border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500' />
          </div>
          <div className='flex flex-col gap-1'>
            <label className='text-sm text-gray-600 font-medium'>NIP (4 digitos)</label>
            <input type='password' value={nip} onChange={e => setNip(e.target.value)} placeholder='Elige tu NIP' maxLength={4} className='border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500' />
          </div>
          <Button onClick={handleRegistro} disabled={cargando} className='w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-6 rounded-2xl'>
            {cargando ? 'Registrando...' : 'Registrarme'}
          </Button>
        </div>
      </div>
    </main>
  )
}