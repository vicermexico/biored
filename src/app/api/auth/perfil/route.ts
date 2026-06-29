import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
  const { data, error } = await supabase.from('usuarios').select('id, nombre, celular, correo, foto_url').eq('id', id).single()
  if (error) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
  return NextResponse.json({ usuario: data })
}

export async function PATCH(request: Request) {
  try {
    const { id, nombre, celular, correo, nip } = await request.json()
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    const updates: any = { nombre, celular, correo }
    if (nip && nip.length === 4) {
      updates.nip_hash = await bcrypt.hash(nip, 10)
    }
    const { data, error } = await supabase.from('usuarios').update(updates).eq('id', id).select('id, nombre, celular, correo, foto_url').single()
    if (error) return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
    return NextResponse.json({ usuario: data })
  } catch (e) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}