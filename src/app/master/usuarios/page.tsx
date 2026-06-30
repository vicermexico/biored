'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
export default function MasterUsuarios() {
  const router = useRouter()
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  useEffect(() => {
    fetch('/api/master/usuarios').then(r => r.json()).then(data => { setUsuarios(data); setCargando(false) })
  }, [])
  const filtrados = usuarios.filter(u => u.celular.includes(busqueda) || u.nombre.toLowerCase().includes(busqueda.toLowerCase()))
  const toggleActivo = async (id: string, activo: boolean) => {
    const res = await fetch('/api/master/usuarios', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, activo: !activo }) })
    if (res.ok) setUsuarios(usuarios.map(u => u.id === id ? {...u, activo: !activo} : u))
  }
  const handleEliminar = async (id: string) => {
    if (!confirm('Eliminar usuario?')) return
    const res = await fetch('/api/master/usuarios', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (res.ok) setUsuarios(usuarios.filter(u => u.id !== id))
  }
  return (
    <main className='min-h-screen bg-gray-50 pb-24'>
      <div className='bg-gray-900 px-6 pt-10 pb-6'>
        <button onClick={() => router.push('/master')} className='text-gray-300 text-sm mb-2 block'>← Panel Master</button>
        <h1 className='text-2xl font-bold text-white'>Usuarios</h1>
        <p className='text-gray-300 text-sm'>{usuarios.length} registrados</p>
      </div>
      <div className='px-6 py-6 flex flex-col gap-4'>
        <input type='text' placeholder='Buscar por celular o nombre' value={busqueda} onChange={e => setBusqueda(e.target.value)} className='border border-gray-200 rounded-xl px-4py-3 text-sm outline-none bg-white' />
        {cargando ? (
          <div className='bg-gray-200 rounded-2xl h-16 animate-pulse'></div>
        ) : filtrados.length === 0 ? (
          <div className='bg-white rounded-2xl p-8 shadow-sm text-center'><p className='text-gray-400 text-sm'>No se encontraron usuarios</p></div>
        ) : (
          filtrados.map(u => (
            <div key={u.id} className='bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3'>
              <div className='flex justify-between items-start'>
                <div>
                  <p className='font-medium text-gray-800'>{u.nombre}</p>
                  <p className='text-sm text-gray-400'>{u.celular}</p>
                </div>
                <span className={'text-xs font-medium px-3 py-1 rounded-full ' + (u.activo ? 'bg-gray-200 text-gray-900' : 'bg-gray-100 text-gray-400')}>
                  {u.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className='flex gap-2'>
                <button onClick={() => toggleActivo(u.id, u.activo)} className={'flex-1 py-2 rounded-xl text-sm font-medium ' + (u.activo ? 'bg-gray-100 text-gray-600' : 'bg-gray-200 text-gray-900')}>
                  {u.activo ? 'Suspender' : 'Activar'}
                </button>
                <button className='flex-1 py-2 rounded-xl text-sm font-medium bg-blue-50 text-blue-600'>Resetear NIP</button>
                <button onClick={() => handleEliminar(u.id)} className='flex-1 py-2 rounded-xl text-sm font-medium bg-red-50 text-red-500'>Eliminar</button>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  )
}