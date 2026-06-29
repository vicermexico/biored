import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)

export async function POST(request: Request) {
  try {
    const { celular, nip } = await request.json()
    if (!celular || !nip) return NextResponse.json({ error: 'Celular y NIP requeridos' }, { status: 400 })
    const { data: usuario, error } = await supabase.from('usuarios').select('*').eq('celular', celular).single()
    if (error || !usuario) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    if (!usuario.activo) return NextResponse.json({ error: 'Cuenta suspendida' }, { status: 403 })
    const nipValido = await bcrypt.compare(nip, usuario.nip_hash)
    if (!nipValido) return NextResponse.json({ error: 'NIP incorrecto' }, { status: 401 })
    return NextResponse.json({ usuario: { id: usuario.id, nombre: usuario.nombre, celular: usuario.celular, correo: usuario.correo, foto_url: usuario.foto_url } })
  } catch (e) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}