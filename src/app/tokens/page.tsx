'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import NavBar from '@/components/NavBar'

export default function MisTokens() {
  const [saldo, setSaldo] = useState(0)
  const [historial, setHistorial] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set())
  const router = useRouter()

  useEffect(() => {
    const u = localStorage.getItem('usuario')
    if (!u) { router.push('/login'); return }
    const usr = JSON.parse(u)
    fetch('/api/tokens/saldo?usuario_id=' + usr.id)
      .then(r => r.json())
      .then(d => setSaldo(d.saldo || 0))
      .catch(() => {})
    fetch('/api/tokens/historial?usuario_id=' + usr.id)
      .then(r => r.json())
      .then(d => { setHistorial(Array.isArray(d) ? d : []); setCargando(false) })
      .catch(() => { setCargando(false) })
  }, [])

  const formatFecha = (fecha: string) => {
    const d = new Date(fecha)
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const toggleExpandido = (id: string) => {
    setExpandidos(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const esCorte = (motivo: string) => motivo?.startsWith('Corte mensual')

  return (
    <main className='min-h-screen bg-gray-50 pb-24'>
      <div className='bg-gray-900 px-6 pt-10 pb-6'>
        <button onClick={() => router.push('/dashboard')} className='text-gray-300 text-sm mb-2 block'>← Regresar</button>
        <h1 className='text-2xl font-bold text-white'>Mis Tokens</h1>
      </div>
      <div className='px-6 py-6 flex flex-col gap-4'>
        <div className='bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center gap-1'>
          <p className='text-xs text-gray-400'>Saldo actual</p>
          <p className='text-5xl font-bold text-red-500'>{saldo}</p>
          <p className='text-sm text-gray-400'>tokens</p>
        </div>

        <p className='text-sm font-medium text-gray-500 px-1'>Historial</p>

        {cargando ? (
          <div className='bg-gray-200 rounded-2xl h-16 animate-pulse' />
        ) : historial.length === 0 ? (
          <div className='bg-white rounded-2xl p-8 shadow-sm text-center'>
            <p className='text-gray-400 text-sm'>Aún no tienes movimientos de tokens</p>
          </div>
        ) : (
          historial.map((h: any) => {
            const expandido = expandidos.has(h.id)
            const esPositivo = h.cantidad >= 0
            return (
              <div key={h.id} className='bg-white rounded-2xl shadow-sm overflow-hidden'>
                <div className='p-4 flex justify-between items-center'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2'>
                      <p className='text-sm font-medium text-gray-800'>{h.motivo}</p>
                      {esCorte(h.motivo) && (
                        <button
                          onClick={() => toggleExpandido(h.id)}
                          className='text-gray-400 text-xs'
                        >
                          {expandido ? '▲' : '▼'}
                        </button>
                      )}
                    </div>
                    <p className='text-xs text-gray-400'>{formatFecha(h.fecha)}</p>
                  </div>
                  <span className={'font-bold text-lg ' + (esPositivo ? 'text-green-600' : 'text-red-500')}>
                    {esPositivo ? `+${h.cantidad}` : `${h.cantidad}`}
                  </span>
                </div>
                {esCorte(h.motivo) && expandido && (
                  <div className='border-t border-gray-100 px-4 py-3 bg-gray-50'>
                    <p className='text-xs text-gray-500 font-medium mb-1'>Desglose</p>
                    <div className='flex justify-between text-sm'>
                      <span className='text-gray-600'>{h.motivo}</span>
                      <span className='font-medium text-gray-800'>{h.cantidad} tokens</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
      <NavBar />
    </main>
  )
}
