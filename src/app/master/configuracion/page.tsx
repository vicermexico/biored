'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function MasterConfiguracion() {
  const router = useRouter()
  const [whatsapp, setWhatsapp] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [imagenUrl, setImagenUrl] = useState('')
  const [subiendo, setSubiendo] = useState('')
  const [guardado, setGuardado] = useState(false)
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    fetch('/api/configuracion').then(r => r.json()).then(d => {
      setWhatsapp(d.whatsapp_numero || '')
      setVideoUrl(d.video_url || '')
      setImagenUrl(d.imagen_url || '')
    }).catch(() => {})
  }, [])

  const subirArchivo = async (archivo: File, tipo: string) => {
    setSubiendo(tipo)
    const formData = new FormData()
    formData.append('archivo', archivo)
    formData.append('carpeta', 'configuracion')
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const data = await res.json()
    if (data.url) {
      if (tipo === 'video') setVideoUrl(data.url)
      if (tipo === 'imagen') setImagenUrl(data.url)
    }
    setSubiendo('')
  }

  const BotonSubir = ({ label, tipo, accept }: { label: string, tipo: string, accept: string }) => {
    const ref = useRef<HTMLInputElement>(null)
    return (
      <div>
        <input ref={ref} type='file' accept={accept} className='hidden' onChange={e => { const f = e.target.files?.[0]; if (f) subirArchivo(f, tipo) }} />
        <button onClick={() => ref.current?.click()} disabled={subiendo === tipo} className='bg-green-700 text-white text-sm px-4 py-2 rounded-xl font-medium disabled:opacity-50 w-full'>
          {subiendo === tipo ? 'Subiendo...' : label}
        </button>
      </div>
    )
  }

  const handleGuardar = async () => {
    setCargando(true)
    try {
      await fetch('/api/configuracion', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ whatsapp, video_url: videoUrl, imagen_url: imagenUrl }) })
      setGuardado(true)
      setTimeout(() => setGuardado(false), 2000)
    } catch {}
    setCargando(false)
  }

  return (
    <main className='min-h-screen bg-gray-50 pb-24'>
      <div className='bg-green-700 px-6 pt-10 pb-6'>
        <button onClick={() => router.push('/master')} className='text-green-200 text-sm mb-2 block'>← Panel Master</button>
        <h1 className='text-2xl font-bold text-white'>Configuracion</h1>
        <p className='text-green-200 text-sm'>Ajustes generales de BIORED</p>
      </div>
      <div className='px-6 py-6 flex flex-col gap-4'>
        {guardado && <p className='text-green-600 text-sm text-center font-medium bg-green-50 py-3 rounded-xl'>Guardado correctamente</p>}
        <div className='bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-4'>
          <p className='font-medium text-gray-700'>Pantalla de inicio</p>
          <div className='flex flex-col gap-2'>
            <label className='text-sm text-gray-500'>Video de inicio (mp4, max 50mb)</label>
            <BotonSubir label='Subir video mp4' tipo='video' accept='video/mp4' />
            {videoUrl && <p className='text-xs text-green-600 font-medium'>✓ Video cargado</p>}
          </div>
          <div className='flex flex-col gap-2'>
            <label className='text-sm text-gray-500'>Imagen de fondo (jpg/png, max 50mb)</label>
            <BotonSubir label='Subir imagen' tipo='imagen' accept='image/*' />
            {imagenUrl && <img src={imagenUrl} className='h-32 w-32 object-cover rounded-xl mt-1' />}
          </div>
        </div>
        <div className='bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-4'>
          <p className='font-medium text-gray-700'>WhatsApp de soporte</p>
          <input type='tel' value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder='Numero de WhatsApp' className='border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500' />
        </div>
        <Button onClick={handleGuardar} disabled={cargando || !!subiendo} className='w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-6 rounded-2xl'>
          {cargando ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </main>
  )
}