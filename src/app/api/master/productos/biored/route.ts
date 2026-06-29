import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)

export async function GET() {
  const { data, error } = await supabase.from('productos_biored').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const { nombre, descripcion_corta, descripcion_larga, precio, foto_url, video_url, fotos_adicionales } = await request.json()
  if (!nombre || !precio) return NextResponse.json({ error: 'Nombre y precio requeridos' }, { status: 400 })
  const fotosStr = typeof fotos_adicionales === 'string' ? fotos_adicionales : JSON.stringify(fotos_adicionales || [])
  const { data, error } = await supabase.from('productos_biored').insert({ nombre, descripcion_corta, descripcion_larga, precio, foto_url, video_url, fotos_adicionales: fotosStr, activo: true }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(request: Request) {
  const { id, nombre, descripcion_corta, descripcion_larga, precio, foto_url, video_url, fotos_adicionales } = await request.json()
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
  const fotosStr = typeof fotos_adicionales === 'string' ? fotos_adicionales : JSON.stringify(fotos_adicionales || [])
  const { error } = await supabase.from('productos_biored').update({ nombre, descripcion_corta, descripcion_larga, precio, foto_url, video_url, fotos_adicionales: fotosStr }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const { id } = await request.json()
  const { error } = await supabase.from('productos_biored').delete().eq('id', id)
  if (error) return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
  return NextResponse.json({ ok: true })
}