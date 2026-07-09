'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-gray-900' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${value ? 'translate-x-7' : 'translate-x-1'}`} />
    </button>
  )
}

export default function MasterJuegos() {
  const router = useRouter()
  const [juegoVideoUrl, setJuegoVideoUrl] = useState('')
  const [juegoTokens, setJuegoTokens] = useState('')
  const [porCompraActivo, setPorCompraActivo] = useState(false)
  const [porCompraCantidad, setPorCompraCantidad] = useState('')
  const [porInvitadoActivo, setPorInvitadoActivo] = useState(false)
  const [subiendo, setSubiendo] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [cargando, setCargando] = useState(false)
  const videoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/configuracion').then(r => r.json()).then(d => {
      setJuegoVideoUrl(d.juego_video_url || '')
      setJuegoTokens(d.juego_tokens ?? '')
      setPorCompraActivo(d.juego_por_compra_activo || false)
      setPorCompraCantidad(d.juego_por_compra_cantidad ?? '')
      setPorInvitadoActivo(d.juego_por_invitado_activo || false)
    }).catch(() => {})
  }, [])

  const subirVideo = async (archivo: File) => {
    setSubiendo(true)
    const formData = new FormData()
    formData.append('archivo', archivo)
    formData.append('carpeta', 'juegos')
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const data = await res.json()
    if (data.url) setJuegoVideoUrl(data.url)
    setSubiendo(false)
  }

  const handleGuardar = async () => {
    setCargando(true)
    try {
      await fetch('/api/configuracion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          juego_video_url: juegoVideoUrl,
          juego_tokens: juegoTokens === '' ? null : Number(juegoTokens),
          juego_por_compra_activo: porCompraActivo,
          juego_por_compra_cantidad: porCompraCantidad === '' ? null : Number(porCompraCantidad),
          juego_por_invitado_activo: porInvitadoActivo,
        }),
      })
      setGuardado(true)
      setTimeout(() => setGuardado(false), 2000)
    } catch {}
    setCargando(false)
  }

  return (
    <main className='min-h-screen bg-gray-50 pb-24'>
      <div className='bg-gray-900 px-6 pt-10 pb-6'>
        <button onClick={() => router.push('/master')} className='text-gray-300 text-sm mb-2 block'>← Panel Master</button>
        <h1 className='text-2xl font-bold text-white'>🎮 Juegos</h1>
        <p className='text-gray-300 text-sm'>Configuración de juegos y recompensas</p>
      </div>
      <div className='px-6 py-6 flex flex-col gap-4'>
        {guardado && <p className='text-gray-700 text-sm text-center font-medium bg-gray-100 py-3 rounded-xl'>Guardado correctamente</p>}

        <div className='bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-4'>
          <p className='font-medium text-gray-700'>Video del juego</p>
          <p className='text-xs text-gray-400'>Video MP4 que se le muestra al usuario cuando gana. Máx 50mb</p>
          <input ref={videoRef} type='file' accept='video/mp4' className='hidden' onChange={e => { const f = e.target.files?.[0]; if (f) subirVideo(f) }} />
          <button onClick={() => videoRef.current?.click()} disabled={subiendo} className='bg-gray-900 text-white text-sm px-4 py-2 rounded-xl font-medium disabled:opacity-50 w-full'>
            {subiendo ? 'Subiendo...' : 'Subir video mp4'}
          </button>
          {juegoVideoUrl && <p className='text-xs text-gray-700 font-medium'>✓ Video cargado</p>}
        </div>

        <div className='bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3'>
          <p className='font-medium text-gray-700'>Tokens a regalar</p>
          <p className='text-xs text-gray-400'>Cantidad de tokens que recibe el usuario al ganar el juego</p>
          <input
            type='number'
            placeholder='Ej: 50'
            value={juegoTokens}
            onChange={e => setJuegoTokens(e.target.value)}
            className='border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-500'
          />
        </div>

        <div className='bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-4'>
          <div className='flex items-center justify-between gap-3'>
            <div className='flex-1'>
              <p className='font-medium text-gray-700 text-sm'>Por compra de productos</p>
              <p className='text-xs text-gray-400 mt-0.5'>Le saldrá el video cuando compre X productos</p>
            </div>
            <Toggle value={porCompraActivo} onChange={setPorCompraActivo} />
          </div>
          {porCompraActivo && (
            <div className='flex flex-col gap-1'>
              <label className='text-xs text-gray-500'>Número de productos (X)</label>
              <input
                type='number'
                placeholder='Ej: 12'
                value={porCompraCantidad}
                onChange={e => setPorCompraCantidad(e.target.value)}
                className='border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-500'
              />
            </div>
          )}
        </div>

        <div className='bg-white rounded-2xl p-4 shadow-sm'>
          <div className='flex items-center justify-between gap-3'>
            <div className='flex-1'>
              <p className='font-medium text-gray-700 text-sm'>Por invitado que compra</p>
              <p className='text-xs text-gray-400 mt-0.5'>Le saldrá el video cuando invite a 1 persona y esa persona compre sus primeros 6 productos</p>
            </div>
            <Toggle value={porInvitadoActivo} onChange={setPorInvitadoActivo} />
          </div>
        </div>

        <Button onClick={handleGuardar} disabled={cargando || subiendo} className='w-full bg-gray-900 hover:bg-black text-white font-semibold py-6 rounded-2xl'>
          {cargando ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </main>
  )
}
