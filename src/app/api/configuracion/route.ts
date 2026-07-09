import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)

export async function GET() {
  const { data } = await supabase.from('configuracion').select('*').single()
  return NextResponse.json(data || {})
}

export async function POST(request: Request) {
  const body = await request.json()
  const { whatsapp, video_url, imagen_url, juego_video_url, juego_tokens, juego_por_compra_activo, juego_por_compra_cantidad, juego_por_invitado_activo } = body

  const updates: Record<string, any> = {}
  if (whatsapp !== undefined) updates.whatsapp_numero = whatsapp
  if (video_url !== undefined) updates.video_url = video_url
  if (imagen_url !== undefined) updates.imagen_url = imagen_url
  if (juego_video_url !== undefined) updates.juego_video_url = juego_video_url
  if (juego_tokens !== undefined) updates.juego_tokens = juego_tokens
  if (juego_por_compra_activo !== undefined) updates.juego_por_compra_activo = juego_por_compra_activo
  if (juego_por_compra_cantidad !== undefined) updates.juego_por_compra_cantidad = juego_por_compra_cantidad
  if (juego_por_invitado_activo !== undefined) updates.juego_por_invitado_activo = juego_por_invitado_activo

  const { data: existing } = await supabase.from('configuracion').select('id').single()
  if (existing) {
    await supabase.from('configuracion').update(updates).eq('id', existing.id)
  } else {
    await supabase.from('configuracion').insert(updates)
  }
  return NextResponse.json({ ok: true })
}
