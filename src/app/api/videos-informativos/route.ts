import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const usuario_id = searchParams.get('usuario_id')
  const master = searchParams.get('master')

  let query = supabase.from('videos_informativos').select('*').order('created_at', { ascending: true })
  if (!master) query = query.eq('activo', true)

  const { data: videos } = await query

  if (!videos || videos.length === 0) return NextResponse.json([])
  if (!usuario_id) return NextResponse.json(videos)

  const { data: vistas } = await supabase
    .from('videos_informativos_vistas')
    .select('*')
    .eq('usuario_id', usuario_id)

  const videosPendientes = videos.filter(v => {
    const vista = vistas?.find((vw: any) => vw.video_id === v.id)
    return !vista || vista.vistas < v.veces_mostrar
  })

  return NextResponse.json(videosPendientes)
}

export async function POST(request: Request) {
  const { video_url, titulo, veces_mostrar, activo } = await request.json()
  if (!video_url) return NextResponse.json({ error: 'video_url requerido' }, { status: 400 })
  const { data, error } = await supabase.from('videos_informativos').insert({ video_url, titulo, veces_mostrar: veces_mostrar || 1, activo: activo ?? true }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(request: Request) {
  const { id, titulo, veces_mostrar, activo } = await request.json()
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
  const { error } = await supabase.from('videos_informativos').update({ titulo, veces_mostrar, activo }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const { id } = await request.json()
  const { error } = await supabase.from('videos_informativos').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}