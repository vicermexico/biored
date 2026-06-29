import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const archivo = formData.get('archivo') as File
    const carpeta = formData.get('carpeta') as string || 'general'

    if (!archivo) return NextResponse.json({ error: 'No se recibio archivo' }, { status: 400 })

    const extension = archivo.name.split('.').pop()
    const nombre = `${carpeta}/${Date.now()}.${extension}`
    const bytes = await archivo.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const { error } = await supabase.storage
      .from('biored')
      .upload(nombre, buffer, { contentType: archivo.type, upsert: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const { data } = supabase.storage.from('biored').getPublicUrl(nombre)

    return NextResponse.json({ url: data.publicUrl })
  } catch (e) {
    return NextResponse.json({ error: 'Error al subir archivo' }, { status: 500 })
  }
}