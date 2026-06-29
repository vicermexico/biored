'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function MasterBiotokens() {
  const router = useRouter()
  const [productos, setProductos] = useState<any[]>([])
  const [agregando, setAgregando] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [subiendo, setSubiendo] = useState(false)
  const [modo, setModo] = useState<'ninguno' | 'agregar' | 'editar'>('ninguno')
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [form, setForm] = useState({ nombre: '', descripcion_corta: '', descripcion_larga: '', precio_tokens: '', foto_url: '', video_url: '' })

  useEffect(() => { cargarProductos() }, [])

  const cargarProductos = () => {
    fetch('/api/master/productos/biotokens').then(r => r.json()).then(data => { setProductos(data); setCargando(false) })
  }

  const handleArchivo = async (e: React.ChangeEvent<HTMLInputElement>, campo: 'foto_url' | 'video_url') => {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    setSubiendo(true)
    const formData = new FormData()
    formData.append('archivo', archivo)
    formData.append('carpeta', 'biotokens')
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const data = await res.json()
    if (data.url) setForm(n => ({ ...n, [campo]: data.url }))
    setSubiendo(false)
  }

  const handleGuardar = async () => {
    if (!form.nombre || !form.precio_tokens) return
    if (modo === 'agregar') {
      const res = await fetch('/api/master/productos/biotokens', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.ok) { cargarProductos(); resetForm() }
    } else if (modo === 'editar' && editandoId) {
      const res = await fetch('/api/master/productos/biotokens', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editandoId, ...form }) })
      if (res.ok) { cargarProductos(); resetForm() }
    }
  }

  const handleEditar = (p: any) => {
    setForm({ nombre: p.nombre || '', descripcion_corta: p.descripcion_corta || '', descripcion_larga: p.descripcion_larga || '', precio_tokens: p.precio_tokens || '', foto_url: p.foto_url || '', video_url: p.video_url || '' })
    setEditandoId(p.id)
    setModo('editar')
  }

  const handleEliminar = async (id: string) => {
    if (!confirm('Eliminar premio?')) return
    const res = await fetch('/api/master/productos/biotokens', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (res.ok) cargarProductos()
  }

  const resetForm = () => {
    setForm({ nombre: '', descripcion_corta: '', descripcion_larga: '', precio_tokens: '', foto_url: '', video_url: '' })
    setModo('ninguno')
    setEditandoId(null)
  }

  return (
    <main className='min-h-screen bg-gray-50 pb-24'>
      <div className='bg-red-500 px-6 pt-10 pb-6'>
        <button onClick={() => router.push('/master')} className='text-red-100 text-sm mb-2 block'>← Panel Master</button>
        <div className='flex justify-between items-end'>
          <div><h1 className='text-2xl font-bold text-white'>Catalogo BioTokens</h1><p className='text-red-100 text-sm'>{productos.length} premios</p></div>
          <button onClick={() => { resetForm(); setModo('agregar') }} className='bg-white text-red-500 font-bold px-4 py-2 rounded-xl text-sm'>+ Agregar</button>
        </div>
      </div>
      <div className='px-6 py-6 flex flex-col gap-3'>
        {(modo === 'agregar' || modo === 'editar') && (
          <div className='bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3 border-2 border-red-500'>
            <p className='font-medium text-gray-700'>{modo === 'agregar' ? 'Nuevo premio' : 'Editar premio'}</p>
            <input type='text' placeholder='Nombre' value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className='border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none' />
            <input type='text' placeholder='Descripcion corta' value={form.descripcion_corta} onChange={e => setForm({...form, descripcion_corta: e.target.value})} className='border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none' />
            <textarea placeholder='Descripcion larga' value={form.descripcion_larga} onChange={e => setForm({...form, descripcion_larga: e.target.value})} rows={3} className='border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none resize-none' />
            <input type='number' placeholder='Tokens' value={form.precio_tokens} onChange={e => setForm({...form, precio_tokens: e.target.value})} className='border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none' />
            <div className='flex flex-col gap-1'>
              <p className='text-xs text-gray-400'>Foto principal</p>
              <input type='file' accept='image/*' onChange={e => handleArchivo(e, 'foto_url')} className='text-sm' />
              {form.foto_url && <img src={form.foto_url} className='h-24 w-24 object-cover rounded-xl' />}
            </div>
            <div className='flex flex-col gap-1'>
              <p className='text-xs text-gray-400'>Video (mp4)</p>
              <input type='file' accept='video/mp4' onChange={e => handleArchivo(e, 'video_url')} className='text-sm' />
              {form.video_url && <p className='text-xs text-red-500'>Video cargado ✓</p>}
            </div>
            {subiendo && <p className='text-xs text-gray-400 text-center'>Subiendo archivo...</p>}
            <div className='flex gap-2'>
              <Button onClick={handleGuardar} disabled={subiendo} className='flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl'>Guardar</Button>
              <Button onClick={resetForm} className='flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl'>Cancelar</Button>
            </div>
          </div>
        )}
        {cargando ? (<div className='bg-gray-200 rounded-2xl h-16 animate-pulse'></div>) : productos.length === 0 ? (
          <div className='bg-white rounded-2xl p-8 shadow-sm text-center'><p className='text-gray-400 text-sm'>No hay premios</p></div>
        ) : (
          productos.map(p => (
            <div key={p.id} className='bg-white rounded-2xl p-4 shadow-sm flex justify-between items-center gap-3'>
              {p.foto_url && <img src={p.foto_url} className='h-12 w-12 object-cover rounded-xl flex-shrink-0' />}
              <div className='flex-1'><p className='font-medium text-gray-800'>{p.nombre}</p><p className='text-red-500 font-bold'>{p.precio_tokens} tokens</p></div>
              <div className='flex gap-3'>
                <button onClick={() => handleEditar(p)} className='text-blue-400 text-sm font-medium'>Editar</button>
                <button onClick={() => handleEliminar(p.id)} className='text-red-400 text-sm font-medium'>Eliminar</button>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  )
}