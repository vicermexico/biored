import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)

export async function POST(request: Request) {
  const { video_id, usuario_id } = await request.json()
  if (!video_id || !usuario_id) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })

  const { data: existente } = await supabase
    .from('videos_informativos_vistas')
    .select('*')
    .eq('video_id', video_id)
    .eq('usuario_id', usuario_id)
    .single()

  if (existente) {
    await supabase
      .from('videos_informativos_vistas')
      .update({ vistas: existente.vistas + 1 })
      .eq('id', existente.id)
  } else {
    await supabase
      .from('videos_informativos_vistas')
      .insert({ video_id, usuario_id, vistas: 1 })
  }

  return NextResponse.json({ ok: true })
}