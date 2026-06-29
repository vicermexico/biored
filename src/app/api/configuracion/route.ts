import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)

export async function GET() {
  const { data } = await supabase.from('configuracion').select('*').single()
  return NextResponse.json(data || {})
}

export async function POST(request: Request) {
  const { whatsapp, video_url, imagen_url } = await request.json()
  const { data: existing } = await supabase.from('configuracion').select('id').single()
  if (existing) {
    await supabase.from('configuracion').update({ whatsapp_numero: whatsapp, video_url, imagen_url }).eq('id', existing.id)
  } else {
    await supabase.from('configuracion').insert({ whatsapp_numero: whatsapp, video_url, imagen_url })
  }
  return NextResponse.json({ ok: true })
}