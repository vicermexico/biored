import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)

export async function GET() {
  const { data, error } = await supabase.from('productos_biotokens').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const { nombre, descripcion_corta, descripcion_larga, precio_tokens, foto_url, video_url, fotos_adicionales, drbioescaner_producto_id } = await request.json()
  if (!nombre || !precio_tokens) return NextResponse.json({ error: 'Nombre y tokens requeridos' }, { status: 400 })
  const { data, error } = await supabase.from('productos_biotokens').insert({ nombre, descripcion_corta, descripcion_larga, precio_tokens, foto_url, video_url, fotos_adicionales, drbioescaner_producto_id: drbioescaner_producto_id || null, activo: true }).select().single()
  if (error) return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(request: Request) {
  const { id, nombre, descripcion_corta, descripcion_larga, precio_tokens, foto_url, video_url, fotos_adicionales, drbioescaner_producto_id } = await request.json()
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
  const { error } = await supabase.from('productos_biotokens').update({ nombre, descripcion_corta, descripcion_larga, precio_tokens, foto_url, video_url, fotos_adicionales, drbioescaner_producto_id: drbioescaner_producto_id || null }).eq('id', id)
  if (error) return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const { id } = await request.json()
  const { error } = await supabase.from('productos_biotokens').delete().eq('id', id)
  if (error) return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
  return NextResponse.json({ ok: true })
}