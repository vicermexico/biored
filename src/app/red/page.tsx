'use client'
import { useState, useEffect } from 'react'
import NavBar from '@/components/NavBar'

export default function MiRed() {
  const [nivelActivo, setNivelActivo] = useState(1)
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [link, setLink] = useState('')
  const [usuarioId, setUsuarioId] = useState('')
  const [modal, setModal] = useState<{ abierto: boolean; data: any | null; cargando: boolean }>({
    abierto: false, data: null, cargando: false,
  })

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

  const verInfo = (invitadoId: string) => {
    setModal({ abierto: true, data: null, cargando: true })
    fetch(`/api/red/info?invitado_id=${invitadoId}`)
      .then(r => r.json())
      .then(data => setModal({ abierto: true, data, cargando: false }))
      .catch(() => setModal({ abierto: false, data: null, cargando: false }))
  }

  const cerrarModal = () => setModal({ abierto: false, data: null, cargando: false })

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
              <div key={i} className='bg-white rounded-2xl p-4 shadow-sm flex justify-between items-center gap-3'>
                <div className='flex-1 min-w-0'>
                  <p className='font-medium text-gray-800 truncate'>{u?.nombre || 'Usuario'}</p>
                  <p className='text-sm text-gray-400'>{u?.celular}</p>
                </div>
                <div className='flex items-center gap-2 flex-shrink-0'>
                  <span className={'text-xs font-medium px-3 py-1 rounded-full ' + (u?.activo ? 'bg-gray-200 text-gray-900' : 'bg-gray-100 text-gray-400')}>
                    {u?.activo ? 'Activo' : 'Inactivo'}
                  </span>
                  <button
                    onClick={() => verInfo(u?.id)}
                    className='text-xs font-medium px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-200'
                  >
                    Ver info
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <button onClick={copiarLink} className='w-full bg-red-500 text-white rounded-2xl p-4 font-medium'>
          Invita a un amigo
        </button>
      </div>
      <NavBar />

      {modal.abierto && (
        <div className='fixed inset-0 z-50 flex items-center justify-center px-6' style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className='bg-white rounded-3xl w-full max-w-sm p-6 flex flex-col gap-4'>
            {modal.cargando ? (
              <div className='flex items-center justify-center py-8'>
                <p className='text-gray-400 text-sm'>Cargando...</p>
              </div>
            ) : (
              <>
                <div>
                  <p className='text-xs text-gray-400'>Invitado</p>
                  <p className='text-lg font-bold text-gray-900'>{modal.data?.nombre}</p>
                  <p className='text-sm text-gray-500'>{modal.data?.celular}</p>
                </div>
                <div className='grid grid-cols-2 gap-3'>
                  <div className='bg-gray-50 rounded-2xl p-4 flex flex-col gap-1'>
                    <p className='text-xs text-gray-400'>Productos este mes</p>
                    <p className='text-3xl font-bold text-gray-900'>{modal.data?.productos_mes}</p>
                  </div>
                  <div className='bg-red-50 rounded-2xl p-4 flex flex-col gap-1'>
                    <p className='text-xs text-gray-400'>Tokens generados</p>
                    <p className='text-3xl font-bold text-red-500'>{modal.data?.tokens_generados}</p>
                  </div>
                </div>
                <p className='text-xs text-gray-400 text-center'>1 token por cada 12 productos comprados</p>
              </>
            )}
            <button onClick={cerrarModal} className='w-full bg-gray-900 text-white font-semibold py-3 rounded-2xl text-sm'>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
