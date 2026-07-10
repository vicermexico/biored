'use client'
import { useState, useEffect } from 'react'
import NavBar from '@/components/NavBar'

export default function MiRed() {
  const [nivelActivo, setNivelActivo] = useState(1)
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [link, setLink] = useState('')
  const [usuarioId, setUsuarioId] = useState('')

  useEffect(() => {
    const u = localStorage.getItem('usuario')
    if (!u) return
    const usr = JSON.parse(u)
    setUsuarioId(usr.id)
    setLink(window.location.origin + '/registro?ref=' + usr.id)
    fetchNivel(usr.id, 1)
  }, [])

  const fetchNivel = (uid: string, nivel: number) => {
    setCargando(true)
    fetch(`/api/red?usuario_id=${uid}&nivel=${nivel}`)
      .then(r => r.json())
      .then(data => {
        setUsuarios(Array.isArray(data) ? data.map((r: any) => r.usuarios) : [])
        setCargando(false)
      })
      .catch(() => { setUsuarios([]); setCargando(false) })
  }

  const handleNivel = (n: number) => {
    setNivelActivo(n)
    if (usuarioId) fetchNivel(usuarioId, n)
  }

  const copiarLink = () => { navigator.clipboard.writeText(link); alert('Link copiado!') }

  return (
    <main className='min-h-screen bg-gray-50 pb-24'>
      <div className='bg-gray-900 px-6 pt-10 pb-6'>
        <h1 className='text-2xl font-bold text-white'>Mi Red</h1>
        <p className='text-gray-300 text-sm'>Hasta 5 niveles de invitados</p>
      </div>
      <div className='px-6 py-6 flex flex-col gap-4'>
        <div className='flex gap-2 overflow-x-auto pb-1'>
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              onClick={() => handleNivel(n)}
              className={'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ' + (nivelActivo === n ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 border border-gray-200')}
            >
              Nivel {n}
            </button>
          ))}
        </div>
        <div className='flex flex-col gap-3'>
          {cargando ? (
            <div className='bg-gray-200 rounded-2xl h-16 animate-pulse' />
          ) : usuarios.length === 0 ? (
            <div className='bg-white rounded-2xl p-8 shadow-sm text-center'>
              <p className='text-gray-400 text-sm'>Aun no tienes invitados en este nivel</p>
            </div>
          ) : (
            usuarios.map((u: any, i: number) => (
              <div key={i} className='bg-white rounded-2xl p-4 shadow-sm flex justify-between items-center'>
                <div>
                  <p className='font-medium text-gray-800'>{u?.nombre || 'Usuario'}</p>
                  <p className='text-sm text-gray-400'>{u?.celular}</p>
                </div>
                <span className={'text-xs font-medium px-3 py-1 rounded-full ' + (u?.activo ? 'bg-gray-200 text-gray-900' : 'bg-gray-100 text-gray-400')}>
                  {u?.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            ))
          )}
        </div>
        <button onClick={copiarLink} className='w-full bg-red-500 text-white rounded-2xl p-4 font-medium'>
          Invita a un amigo
        </button>
      </div>
      <NavBar />
    </main>
  )
}
