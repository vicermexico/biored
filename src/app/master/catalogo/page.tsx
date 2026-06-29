'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function MasterCatalogo() {
  const router = useRouter()
  const [productos, setProductos] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [subiendo, setSubiendo] = useState('')
  const [modo, setModo] = useState<'ninguno' | 'agregar' | 'editar'>('ninguno')
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [form, setForm] = useState({ nombre: '', descripcion_corta: '', descripcion_larga: '', precio: '', foto_url: '', video_url: '', fotos_adicionales: [] as string[] })

  useEffect(() => { cargarProductos() }, [])

  const cargarProductos = () => {
    fetch('/api/master/productos/biored').then(r => r.json()).then(data => { setProductos(data); setCargando(false) })
  }

  const handleArchivo = async (e: React.ChangeEvent<HTMLInputElement>, campo: string, index?: number) => {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    setSubiendo(campo)
    const formData = new FormData()
    formData.append('archivo', archivo)
    formData.append('carpeta', 'biored')
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const data = await res.json()
    if (data.url) {
      if (campo === 'fotos_adicionales' && index !== undefined) {
        const nuevas = [...form.fotos_adicionales]
        nuevas[index] = data.url
        setForm(f => ({ ...f, fotos_adicionales: nuevas }))
      } else {
        setForm(f => ({ ...f, [campo]: data.url }))
      }
    }
    setSubiendo('')
  }

  const agregarFotoAdicional = () => {
    if (form.fotos_adicionales.length < 4) {
      setForm(f => ({ ...f, fotos_adicionales: [...f.fotos_adicionales, ''] }))
    }
  }

  const eliminarFotoAdicional = (index: number) => {
    const nuevas = form.fotos_adicionales.filter((_, i) => i !== index)
    setForm(f => ({ ...f, fotos_adicionales: nuevas }))
  }

  const handleGuardar = async () => {
    if (!form.nombre || !form.precio) return
    const body = { ...form, fotos_adicionales: JSON.stringify(form.fotos_adicionales) }
    if (modo === 'agregar') {
      const res = await fetch('/api/master/productos/biored', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) { cargarProductos(); resetForm() }
    } else if (modo === 'editar' && editandoId) {
      const res = await fetch('/api/master/productos/biored', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editandoId, ...body }) })
      if (res.ok) { cargarProductos(); resetForm() }
    }
  }

  const handleEditar = (p: any) => {
    let fotos = []
    try { fotos = JSON.parse(p.fotos_adicionales || '[]') } catch { fotos = [] }
    setForm({ nombre: p.nombre || '', descripcion_corta: p.descripcion_corta || '', descripcion_larga: p.descripcion_larga || '', precio: p.precio || '', foto_url: p.foto_url || '', video_url: p.video_url || '', fotos_adicionales: fotos })
    setEditandoId(p.id)
    setModo('editar')
  }

  const handleEliminar = async (id: string) => {
    if (!confirm('Eliminar producto?')) return
    const res = await fetch('/api/master/productos/biored', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (res.ok) cargarProductos()
  }

  const resetForm = () => {
    setForm({ nombre: '', descripcion_corta: '', descripcion_larga: '', precio: '', foto_url: '', video_url: '', fotos_adicionales: [] })
    setModo('ninguno')
    setEditandoId(null)
  }

  return (
    <main className='min-h-screen bg-gray-50 pb-24'>
      <div className='bg-green-700 px-6 pt-10 pb-6'>
        <button onClick={() => router.push('/master')} className='text-green-200 text-sm mb-2 block'>← Panel Master</button>
        <div className='flex justify-between items-end'>
          <div><h1 className='text-2xl font-bold text-white'>Catalogo BIORED</h1><p className='text-green-200 text-sm'>{productos.length} productos</p></div>
          <button onClick={() => { resetForm(); setModo('agregar') }} className='bg-white text-green-700 font-bold px-4 py-2 rounded-xl text-sm'>+ Agregar</button>
        </div>
      </div>
      <div className='px-6 py-6 flex flex-col gap-3'>
        {(modo === 'agregar' || modo === 'editar') && (
          <div className='flex flex-col gap-4'>
            <p className='font-semibold text-gray-700 text-lg'>{modo === 'agregar' ? 'Nuevo producto' : 'Editar producto'}</p>

            <div className='bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3'>
              <p className='font-medium text-gray-700 text-sm'>Información general</p>
              <input type='text' placeholder='Nombre' value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className='border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500' />
              <input type='text' placeholder='Descripcion corta (sale en galería)' value={form.descripcion_corta} onChange={e => setForm({...form, descripcion_corta: e.target.value})} className='border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500' />
              <textarea placeholder='Descripcion larga (sale en detalle)' value={form.descripcion_larga} onChange={e => setForm({...form, descripcion_larga: e.target.value})} rows={3} className='border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500 resize-none' />
              <input type='number' placeholder='Precio' value={form.precio} onChange={e => setForm({...form, precio: e.target.value})} className='border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500' />
            </div>

            <div className='bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3'>
              <p className='font-medium text-gray-700 text-sm'>Imagen principal de galería</p>
              <p className='text-xs text-gray-400'>Esta imagen es la que ve el usuario en el catálogo</p>
              <input type='file' accept='image/*' onChange={e => handleArchivo(e, 'foto_url')} className='text-sm' />
              {subiendo === 'foto_url' && <p className='text-xs text-gray-400'>Subiendo...</p>}
              {form.foto_url && <img src={form.foto_url} className='h-32 w-32 object-cover rounded-xl' />}
            </div>

            <div className='bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3'>
              <p className='font-medium text-gray-700 text-sm'>Video del producto (mp4)</p>
              <p className='text-xs text-gray-400'>El video se reproduce al abrir el producto. Máx 50mb</p>
              <input type='file' accept='video/mp4' onChange={e => handleArchivo(e, 'video_url')} className='text-sm' />
              {subiendo === 'video_url' && <p className='text-xs text-gray-400'>Subiendo video...</p>}
              {form.video_url && <p className='text-xs text-green-600 font-medium'>✓ Video cargado</p>}
            </div>

            <div className='bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3'>
              <div className='flex justify-between items-center'>
                <div>
                  <p className='font-medium text-gray-700 text-sm'>Imágenes adicionales</p>
                  <p className='text-xs text-gray-400'>Aparecen después del video. Máx 4 imágenes</p>
                </div>
                {form.fotos_adicionales.length < 4 && (
                  <button onClick={agregarFotoAdicional} className='bg-green-700 text-white text-xs px-3 py-2 rounded-xl font-medium'>+ Agregar</button>
                )}
              </div>
              {form.fotos_adicionales.length === 0 && (
                <p className='text-xs text-gray-300 text-center py-4'>Sin imágenes adicionales</p>
              )}
              {form.fotos_adicionales.map((url, i) => (
                <div key={i} className='border border-gray-100 rounded-xl p-3 flex flex-col gap-2'>
                  <div className='flex justify-between items-center'>
                    <p className='text-xs text-gray-500'>Imagen {i + 1}</p>
                    <button onClick={() => eliminarFotoAdicional(i)} className='text-red-400 text-xs'>Quitar</button>
                  </div>
                  <input type='file' accept='image/*' onChange={e => handleArchivo(e, 'fotos_adicionales', i)} className='text-sm' />
                  {subiendo === `fotos_adicionales_${i}` && <p className='text-xs text-gray-400'>Subiendo...</p>}
                  {url && <img src={url} className='h-24 w-24 object-cover rounded-xl' />}
                </div>
              ))}
            </div>

            <div className='flex gap-2'>
              <Button onClick={handleGuardar} disabled={!!subiendo} className='flex-1 bg-green-700 hover:bg-green-800 text-white rounded-xl py-6'>Guardar</Button>
              <Button onClick={resetForm} className='flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl py-6'>Cancelar</Button>
            </div>
          </div>
        )}

        {cargando ? (<div className='bg-gray-200 rounded-2xl h-16 animate-pulse'></div>) : productos.length === 0 ? (
          <div className='bg-white rounded-2xl p-8 shadow-sm text-center'><p className='text-gray-400 text-sm'>No hay productos</p></div>
        ) : (
          productos.map(p => (
            <div key={p.id} className='bg-white rounded-2xl p-4 shadow-sm flex justify-between items-center gap-3'>
              {p.foto_url && <img src={p.foto_url} className='h-12 w-12 object-cover rounded-xl flex-shrink-0' />}
              <div className='flex-1'><p className='font-medium text-gray-800'>{p.nombre}</p><p className='text-green-700 font-bold'>${p.precio}</p></div>
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