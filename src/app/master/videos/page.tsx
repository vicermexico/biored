'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function MasterVideos() {
  const router = useRouter()
  const [videos, setVideos] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [subiendo, setSubiendo] = useState(false)
  const [modo, setModo] = useState<'ninguno' | 'agregar' | 'editar'>('ninguno')
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [form, setForm] = useState({ titulo: '', veces_mostrar: 1, video_url: '' })
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { cargar() }, [])

  const cargar = () => {
    fetch('/api/videos-informativos?master=1').then(r => r.json()).then(d => { setVideos(d); setCargando(false) })
  }

  const subirVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    setSubiendo(true)
    const formData = new FormData()
    formData.append('archivo', archivo)
    formData.append('carpeta', 'videos-informativos')
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const data = await res.json()
    if (data.url) setForm(f => ({ ...f, video_url: data.url }))
    setSubiendo(false)
  }

  const handleGuardar = async () => {
    if (modo === 'agregar') {
      if (!form.video_url) return
      const res = await fetch('/api/videos-informativos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (res.ok) { cargar(); resetForm() }
    } else if (modo === 'editar' && editandoId) {
      const res = await fetch('/api/videos-informativos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editandoId, titulo: form.titulo, veces_mostrar: form.veces_mostrar })
      })
      if (res.ok) { cargar(); resetForm() }
    }
  }

  const handleEditar = (v: any) => {
    setForm({ titulo: v.titulo || '', veces_mostrar: v.veces_mostrar, video_url: v.video_url })
    setEditandoId(v.id)
    setModo('editar')
  }

  const toggleActivo = async (id: string, activo: boolean) => {
    await fetch('/api/videos-informativos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, activo: !activo })
    })
    cargar()
  }

  const eliminar = async (id: string) => {
    if (!confirm('¿Eliminar este video?')) return
    await fetch('/api/videos-informativos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    cargar()
  }

  const resetForm = () => {
    setForm({ titulo: '', veces_mostrar: 1, video_url: '' })
    setModo('ninguno')
    setEditandoId(null)
  }

  return (
    <main className='min-h-screen bg-gray-50 pb-24'>
      <div className='bg-green-700 px-6 pt-10 pb-6'>
        <button onClick={() => router.push('/master')} className='text-green-200 text-sm mb-2 block'>← Panel Master</button>
        <div className='flex justify-between items-end'>
          <div>
            <h1 className='text-2xl font-bold text-white'>Videos Informativos</h1>
            <p className='text-green-200 text-sm'>{videos.length} videos</p>
          </div>
          {modo === 'ninguno' && (
            <button onClick={() => setModo('agregar')} className='bg-white text-green-700 font-bold px-4 py-2 rounded-xl text-sm'>+ Agregar</button>
          )}
        </div>
      </div>

      <div className='px-6 py-6 flex flex-col gap-4'>
        {(modo === 'agregar' || modo === 'editar') && (
          <div className='bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3 border-2 border-green-500'>
            <p className='font-medium text-gray-700'>{modo === 'agregar' ? 'Nuevo video informativo' : 'Editar video'}</p>
            <input type='text' placeholder='Título (opcional)' value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} className='border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500' />
            <div className='flex flex-col gap-1'>
              <label className='text-xs text-gray-500'>¿Cuántas veces se mostrará al usuario?</label>
              <input type='number' min={1} value={form.veces_mostrar} onChange={e => setForm({ ...form, veces_mostrar: parseInt(e.target.value) || 1 })} className='border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500' />
            </div>
            {modo === 'agregar' && (
              <div className='flex flex-col gap-1'>
                <label className='text-xs text-gray-500'>Video (mp4)</label>
                <input ref={inputRef} type='file' accept='video/mp4' className='hidden' onChange={subirVideo} />
                <button onClick={() => inputRef.current?.click()} disabled={subiendo} className='bg-green-700 text-white text-sm px-4 py-2 rounded-xl font-medium disabled:opacity-50'>
                  {subiendo ? 'Subiendo...' : 'Subir video mp4'}
                </button>
                {form.video_url && <p className='text-xs text-green-600 font-medium'>✓ Video cargado</p>}
              </div>
            )}
            <div className='flex gap-2'>
              <Button onClick={handleGuardar} disabled={modo === 'agregar' && (!form.video_url || subiendo)} className='flex-1 bg-green-700 hover:bg-green-800 text-white rounded-xl py-6'>Guardar</Button>
              <Button onClick={resetForm} className='flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl py-6'>Cancelar</Button>
            </div>
          </div>
        )}

        {cargando ? (
          <div className='bg-gray-200 rounded-2xl